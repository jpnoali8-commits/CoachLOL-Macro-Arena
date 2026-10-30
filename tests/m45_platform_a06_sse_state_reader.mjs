export async function readFirstSseState(reader,{maxBytes=2*1024*1024}={}){
  if(!reader||typeof reader.read!=='function')throw TypeError('sse_reader_invalido');
  const decoder=new TextDecoder();
  let buffer='',bytes=0;
  for(;;){
    const {done,value}=await reader.read();
    if(done)throw Error('sse_stream_ended_before_state');
    bytes+=value.byteLength;
    if(bytes>maxBytes)throw Error('sse_frame_too_large');
    buffer=(buffer+decoder.decode(value,{stream:true})).replace(/\r\n/g,'\n');
    let split;
    while((split=buffer.indexOf('\n\n'))!==-1){
      const frame=buffer.slice(0,split);buffer=buffer.slice(split+2);
      const lines=frame.split('\n');
      const type=lines.find(x=>x.startsWith('event:'))?.slice(6).trim();
      if(type!=='state')continue;
      const data=lines.filter(x=>x.startsWith('data:')).map(x=>x.slice(5).replace(/^ /,'')).join('\n');
      return JSON.parse(data);
    }
  }
}
