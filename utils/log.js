import colors from 'colors';
import moment from 'moment';

export default class log {
  constructor (mod) {
    this.mod = mod;
  }
  now () {
    return moment().format('YYYY-MM-DD HH:mm:ss');
  }
  i (msg) {
    console.log(`[${this.now()}]`.gray + `[${this.mod}]`.magenta + '[INFO] '.cyan + `${msg}`);
  }
  e (msg) {
    console.log(`[${this.now()}]`.gray + `[${this.mod}]`.magenta + '[ERROR] '.red + `${msg}`);
  }
  w (msg) {
    console.log(`[${this.now()}]`.gray + `[${this.mod}]`.magenta + '[WARNING] '.red + `${msg}`);
  }
  s (msg) {
    console.log(`[${this.now()}]`.gray + `[${this.mod}]`.magenta + '[SUCCEED] '.green + `${msg}`);
  }
  f (msg) {
    console.log(`[${this.now()}]`.gray + `[${this.mod}]`.magenta + '[FAILED] '.red + `${msg}`);
  }
}
