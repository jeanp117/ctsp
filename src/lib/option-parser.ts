export class OptionParser {
  options: Option[] = [];

  constructor(options: Option[]) {
    this.options = options;
  }

  exec() {
    this.options.map(option => {
      option.command.forEach(entry => {
        if (process.argv.includes(entry)) {
          option.callback();
        }
      });
    });
  }
}

export interface Option {
  command: string[],
  callback: any,
}
