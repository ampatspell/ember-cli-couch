import Route from '@ember/routing/route';
import { reject, hash } from 'rsvp';

export default Route.extend({

  insertMessage() {
    let db = this.get('db');
    return db.load('first').catch(err => {
      if(err.status === 404) {
        let message = {
          _id: 'first',
          type: 'message',
          message: 'To whom it may concern: It is springtime. It is late afternoon.',
          author: 'Kurt Vonnegut'
        };
        return db.save(message).then(json => {
          message._rev = json.rev;
          return message;
        });
      }
      return reject(err);
    });
  },

  model() {
    return hash({
      message: this.insertMessage(),
      database: this.get('db').info(),
      couch: this.get('db.couch').info(),
      session: this.get('db.couch.session').load(),
      url: this.get('db.url')
    });
  }
});
