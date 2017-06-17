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
import DatabaseChanges from 'couch/couch/database/changes';
import CouchChanges from 'couch/couch/changes';
import ChangesFeedEventSource from 'couch/couch/changes/feed/unified/event-source';
import ChangesFeedLongPolling from 'couch/couch/changes/feed/unified/long-polling';

export default {
  name: 'couch:internal',
  initialize(container) {
    container.register('couch:couches', Couches);
    container.register('couch:couch', Couch);
    container.register('couch:request', Request);
    container.register('couch:session', Session);
    container.register('couch:databases', Databases);
    container.register('couch:database', Database);
    container.register('couch:database-database', DatabaseDatabase);
    container.register('couch:database-security', Security);
    container.register('couch:database-design', Design);
    container.register('couch:database-mango', Mango);
    container.register('couch:database-changes', DatabaseChanges);
    container.register('couch:database-changes/feed/event-source', ChangesFeedEventSource);
    container.register('couch:database-changes/feed/long-polling', ChangesFeedLongPolling);
    container.register('couch:couch-changes', CouchChanges);
    container.register('couch:couch-changes/feed/event-source', ChangesFeedEventSource);
    container.register('couch:couch-changes/feed/long-polling', ChangesFeedLongPolling);
  }
};
