import Couches from 'couch/couches';
import Couch from 'couch/couch';
import Request from 'couch/couch/request';
import Session from 'couch/couch/session';
import Databases from 'couch/couch/database/databases';
import Database from 'couch/couch/database';
import Security from 'couch/couch/database/security';
import Design from 'couch/couch/database/design';
import DatabaseDatabase from 'couch/couch/database/database';
import Mango from 'couch/couch/database/mango';

export default {
  name: 'couch:internal',
  initialize(container) {
    container.register('couch:couches', Couches, { instantiate: false });
    container.register('couch:couch', Couch, { instantiate: false });
    container.register('couch:request', Request, { instantiate: false });
    container.register('couch:session', Session, { instantiate: false });
    container.register('couch:databases', Databases, { instantiate: false });
    container.register('couch:database', Database, { instantiate: false });
    container.register('couch:database-database', DatabaseDatabase, { instantiate: false });
    container.register('couch:database-security', Security, { instantiate: false });
    container.register('couch:database-design', Design, { instantiate: false });
    container.register('couch:database-mango', Mango, { instantiate: false });
  }
};
