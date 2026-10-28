/** Dev47 extends the audited dev44 gateway without changing its legacy action whitelist. */
import {AuthoritativeActionsV453Dev44} from './authoritative_actions_v453_dev44.mjs';
export const PLAYER_ACTION_KINDS_V453_DEV47=Object.freeze(['order.retreat','order.plant','decision.reaction','decision.duel']);
export class AuthoritativeActionsV453Dev47 extends AuthoritativeActionsV453Dev44{
 constructor(arena,seats,opts){super(arena,seats,opts);this.dev47Enabled=true;}
}
