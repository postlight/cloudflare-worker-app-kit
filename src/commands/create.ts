import { Command, flags } from "@oclif/command";

export default class Create extends Command {
  static description = "Generate a new Cloudflare Worker app project";

  static flags = {
    help: flags.help({ char: "h" }),
    react: flags.boolean(),
    javascript: flags.boolean()
  };

  static args = [
    { name: "appName", description: "Worker app name", required: true }
  ];

  async run() {
    const { args, flags } = this.parse(Create);

    if (flags.react) {
      this.log("TODO: use react instead of preact");
    }

    if (flags.javascript) {
      this.log("TODO: use plain js instead of ts");
    }

    this.log(`Generating ${args.appName}!`);
  }
}
