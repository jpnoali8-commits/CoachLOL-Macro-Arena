/** CoachLOL M45 A07: incremental SSE decoder for reproducible transport oracles. */
export class SseStateDecoder {
  constructor({maxFrameBytes=2*1024*1024}={}) {
    if (!Number.isSafeInteger(maxFrameBytes) || maxFrameBytes<1) throw RangeError('max_frame_invalid');
    this.maxFrameBytes=maxFrameBytes;
    this.decoder=new TextDecoder('utf-8',{fatal:true});
    this.encoder=new TextEncoder();
    this.buffer='';
  }
  push(chunk){
    if(!(chunk instanceof Uint8Array))throw TypeError('sse_chunk_invalid');
    this.buffer+=this.decoder.decode(chunk,{stream:true});
    this.buffer=this.buffer.replace(/\r\n/g,'\n');
    const ready=[];
    for(;;){
      const at=this.buffer.indexOf('\n\n');
      if(at===-1)break;
      const frame=this.buffer.slice(0,at);
      this.buffer=this.buffer.slice(at+2);
      if(this.encoder.encode(frame).byteLength>this.maxFrameBytes)throw Error('sse_frame_too_large');
      const lines=frame.split('\n');
      const event=lines.filter(x=>x.startsWith('event:')).at(-1)?.slice(6).trim()||'message';
      if(event!=='state')continue;
      const raw=lines.filter(x=>x.startsWith('data:')).map(x=>x.slice(5).replace(/^ /,'')).join('\n');
      if(!raw)throw Error('sse_state_missing_data');
      const state=JSON.parse(raw);
      if(state===null||typeof state!=='object'||Array.isArray(state))throw Error('sse_state_invalid_json_shape');
      const id=lines.filter(x=>x.startsWith('id:')).at(-1)?.slice(3).trim()||null;
      ready.push({id,state});
    }
    if(this.encoder.encode(this.buffer).byteLength>this.maxFrameBytes)throw Error('sse_frame_too_large');
    return ready;
  }
}
export class SseStateStream {
  constructor(body,options){
    if(!body||typeof body.getReader!=='function')throw TypeError('sse_body_invalid');
    this.reader=body.getReader();this.parser=new SseStateDecoder(options);this.queue=[];this.closed=false;
  }
  async next(){
    if(this.closed)throw Error('sse_reader_closed');
    for(;;){
      if(this.queue.length)return this.queue.shift();
      const {done,value}=await this.reader.read();
      if(done)throw Error('sse_stream_ended_before_next_state');
      this.queue.push(...this.parser.push(value));
    }
  }
  async close(){
    if(this.closed)return;
    this.closed=true;
    try{await this.reader.cancel();}finally{this.reader.releaseLock();}
  }
}
