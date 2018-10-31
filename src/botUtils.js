
module.exports = {
  processCommand: function(prefix, message, knownCommands, username, object, target) {
    // This isn't a command since it has no prefix:
    if (message.substr(0, 1) !== prefix) {
      console.log(`[${target}] ${username}: ${message}`);
      return false;
    }

    // Split the message into individual words:
    const parse = message.slice(1).split(' ');
    // The command name is the first (0th) one:
    const commandName = parse[0];
    // The rest (if any) are the parameters:
    const params = parse.splice(1);

    // If the command is known, let's execute it:
    if (commandName in knownCommands) {
      // Retrieve the function by its name:
      const command = knownCommands[commandName];
      // Then call the command with parameters:
      command(target, object, params);
      console.log(`* Executed ${commandName} command for ${username}`);
    } else {
      console.log(`* Unknown command ${commandName} from ${username}`);
    }
  }
}