import { Command, CommandArguments } from '../../shared/types'
import { spawn } from 'child_process'
import Management from '../../shared/management'

class Env implements Command {
  name = 'env'
  args = [
    {
      name: 'name',
      optional: false,
      description: 'Name of the tenant you want in your env'
    }
  ]
  description = 'Set env variables for a specific tenant'

  async execute(args: CommandArguments, management: Management) {
    const [name] = args.args

    const tenant = await management.read(name)

    process.env.PMT_URL = tenant.url

    console.log(`\n  Running \`${args.secondary}\` on tenant "${name}"\n`)

    const [command, ...commandArguments] = args.secondary.split(' ')

    spawn(command, commandArguments, {
      stdio: 'inherit'
    }).on('exit', (exitCode: number) => process.exit(exitCode))
  }
}

export default new Env()