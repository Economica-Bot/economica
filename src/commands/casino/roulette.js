const bet = {
  name: 'bet',
  description: 'Place a bet.',
  type: 'INTEGER',
  required: true,
}

const number_one = {
  name: 'number_one',
  description: 'Specify the first number.',
  type: 'INTEGER',
  required: true,
}

const number_two = {
  name: 'number_two',
  description: 'Specify the second number.',
  type: 'INTEGER',
  required: true,
}

const number_three = {
  name: 'number_three',
  description: 'Specify the third number.',
  type: 'INTEGER',
  required: true,
}

const number_four = {
  name: 'number_four',
  description: 'Specify the fourth number.',
  type: 'INTEGER',
  required: true,
}

const number_five = {
  name: 'number_five',
  description: 'Specify the fifth number.',
  type: 'INTEGER',
  required: true,
}

const number_six = {
  name: 'number_six',
  description: 'Specify the sixth number.',
  type: 'INTEGER',
  required: true,
}

module.exports = {
  name: 'roulette',
  description: 'Play roulette.',
  group: 'casino',
  global: true,
  options: [
    {
      name: 'inside',
      description: 'Inside Bets',
      type: 'SUB_COMMAND_GROUP',
      options: [
        {
          name: 'single',
          description: 'Bet on a single number.',
          type: 'SUB_COMMAND',
          options: [
            number_one,
            bet
          ],
      ***REMOVED***
        {
          name: 'split',
          description: 'Bet on two vertically/horizontally adjacent numbers.',
          type: 'SUB_COMMAND',
          options: [
            number_one,
            number_two,
            bet
          ],
      ***REMOVED***
        {
          name: 'street',
          description: 'Bet on three consecutive numbers in a horizontal line.',
          type: 'SUB_COMMAND',
          options: [
            number_one,
            number_two,
            number_three,
            bet
          ],
      ***REMOVED***
        {
          name: 'corner',
          description: 'Bet on four numbers that meet at one corner.',
          type: 'SUB_COMMAND',
          options: [
            number_one,
            number_two,
            number_three,
            number_four,
            bet
          ],
      ***REMOVED***
        {
          name: 'double_street',
          description:
            'Bet on six consecutive numbers that form two horizontal lines.',
          type: 'SUB_COMMAND',
          options: [
            number_one,
            number_two,
            number_three, 
            number_four, 
            number_five,
            number_six,
            bet
          ],
      ***REMOVED***
        {
          name: 'trio',
          description: 'A three-number bet that involves at least one zero.',
          type: 'SUB_COMMAND',
          options: [
            number_one,
            number_two,
            number_three,
            bet
          ],
      ***REMOVED***
        {
          name: 'first_four',
          description: 'Bet on 0-1-2-3.',
          type: 'SUB_COMMAND',
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'outside',
      description: 'Outside Bets',
      type: 'SUB_COMMAND_GROUP',
      options: [
        {
          name: 'half',
          description: 'A bet that the number will be in the chosen range.',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'choice',
              description: 'Choose High or Low',
              type: 'STRING',
              required: true, 
              choices: [
                {
                  name: 'low',
                  value: 'low',
              ***REMOVED***
                {
                  name: 'high',
                  value: 'high',
              ***REMOVED***
              ],
          ***REMOVED***
            bet
          ],
      ***REMOVED***
        {
          name: 'color',
          description: 'A bet that the number will be the chosen color.',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'choice',
              description: 'Choose Red or Black',
              type: 'STRING',
              required: true, 
              choices: [
                {
                  name: 'red',
                  value: 'red',
              ***REMOVED***
                {
                  name: 'black',
                  value: 'black',
              ***REMOVED***
              ],
          ***REMOVED***
            bet
          ],
      ***REMOVED***
        {
          name: 'even_or_odd',
          description: 'A bet that the number will be of the chosen type.',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'choice',
              description: 'Choose Even or Odd',
              type: 'STRING',
              required: true, 
              choices: [
                {
                  name: 'Even',
                  value: 'even',
              ***REMOVED***
                {
                  name: 'Odd',
                  value: 'odd',
              ***REMOVED***
              ],
          ***REMOVED***
            bet
          ],
      ***REMOVED***
        {
          name: 'dozen',
          description: 'A bet that the number will be in the chosen dozen.',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'choice',
              description: 'Choose a dozen',
              type: 'STRING',
              required: true, 
              choices: [
                {
                  name: 'First Dozen',
                  value: 'first',
              ***REMOVED***
                {
                  name: 'Second Dozen',
                  value: 'second',
              ***REMOVED***
                {
                  name: 'Third Dozen',
                  value: 'third',
              ***REMOVED***
              ],
          ***REMOVED***
            bet
          ],
      ***REMOVED***
        {
          name: 'column',
          description:
            'A bet that the number will be in the chosen vertical column.',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'choice',
              description: 'Choose a column',
              type: 'STRING',
              required: true, 
              choices: [
                {
                  name: 'First Column',
                  value: 'first',
              ***REMOVED***
                {
                  name: 'Second Column',
                  value: 'second',
              ***REMOVED***
                {
                  name: 'Third Column',
                  value: 'third',
              ***REMOVED***
              ],
          ***REMOVED***
            bet
          ],
      ***REMOVED***
        {
          name: 'snake',
          description:
            'A special bet that covers the numbers 1, 5, 9, 12, 14, 16, 19, 23, 27, 30, 32, and 34.',
          type: 'SUB_COMMAND',
      ***REMOVED***
      ],
  ***REMOVED***
  ], //https://crescent.edu/post/the-basic-rules-of-roulette
  async run(interaction, guild, author, options) {
    let color = 'GREEN',
      title = author.user.username,
      icon_url = author.user.displayAvatarURL(),
      description = '';
    const cSymbol = await util.getCurrencySymbol(guild.id);
    const { wallet } = await util.getEconInfo(guild.id, author.user.id);
    const ballPocket = await Math.floor(Math.random() * 36 + 1)
    const nums = []
    for(const option of options._hoistedOptions) {
      if([num_one, num_two, num_three, num_four, num_five, num_six].includes(option.name)) {
        if (option.value < 0 || option.value > 36) {
          color = 'RED';
          description += `Invalid \`${option.name}\`: \`${option.value}\`\n`;
        } else {
          nums.push({name: option.name, value: option.value})
        }
      }

      if (option.name === 'bet') {
        if (bet < 0 || bet > wallet) {
          (color = 'RED'),
            (description += `Insufficient wallet: ${cSymbol}${wallet.toLocaleString()}\n`);
        } else {
          bet = option.value
        }
      }
    }

    if(description.length) {
      interaction.reply({ embeds: [util.embedify(color, title, icon_url, description)] })
      return
    }

    if(options._group === 'inside') {
      if(options._subcommand === 'single') {
        description += `The ball landed on \`${ballPocket}\`\n`;
      if (number === ballPocket) {
        bet *= 4;
        description += `You won ${cSymbol}${bet.toLocaleString()}`;
        } else {
          (color = 'RED'),
            (description += `You lost ${cSymbol}${bet.toLocaleString()}`);
          bet *= -1;
        }
      } else if(options._subcommand === 'split') {
        if(Math.abs(number_one - number_two) <= 1 || Math.abs(number_one - number_two) === 3) {
          
        }
      }
    } 


    await util.transaction(
      guild.id,
      author.user.id,
      this.name,
      description,
      bet,
      0,
      bet
    );

    await interaction.reply({
      embeds: [util.embedify(color, title, icon_url, description)],
    });
***REMOVED***
};
