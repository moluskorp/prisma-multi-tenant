import { Command, CommandArguments } from '../../shared/types'
import prompt from '../helpers/prompt'
import chalk = require('chalk')
import lift from './lift'
import Management from '../../shared/management'

class Delete implements Command {
  name = 'delete'
  args = [
    {
      name: 'name',
      description: 'Name of the tenant you want to delete'
    }
  ]
  description = 'Delete one tenant'

  async execute(args: CommandArguments, management: Management) {
    console.log()

    const [name] = args.args

    if (
      !(await prompt.confirm(chalk`{red Are you sure you want to delete the tenant "${name}"?}`))
    ) {
      return
    }

    await lift.liftOneTenant(management, 'down', name)
    await management.delete(name)

    console.log(chalk`\n✅  {green Lifted down "${name}" and deleted it from management!}\n`)
    console.log(chalk`  {blue Note: You are still in charge of deleting the database!}\n`)
  }
}

export default new Delete()