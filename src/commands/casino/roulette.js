const bet = {
  name: 'bet',
  description: 'Place a bet.',
  type: 'INTEGER',
  required: true,
};

const number_one = {
  name: 'number_one',
  description: 'Specify the first number.',
  type: 'INTEGER',
  required: true,
};

const number_two = {
  name: 'number_two',
  description: 'Specify the second number.',
  type: 'INTEGER',
  required: true,
};

const number_three = {
  name: 'number_three',
  description: 'Specify the third number.',
  type: 'INTEGER',
  required: true,
};

const number_four = {
  name: 'number_four',
  description: 'Specify the fourth number.',
  type: 'INTEGER',
  required: true,
};

const number_five = {
  name: 'number_five',
  description: 'Specify the fifth number.',
  type: 'INTEGER',
  required: true,
};

const number_six = {
  name: 'number_six',
  description: 'Specify the sixth number.',
  type: 'INTEGER',
  required: true,
};

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
          options: [number_one, bet],
      ***REMOVED***
        {
          name: 'split',
          description:
            'Bet on two distinct vertically/horizontally adjacent numbers.',
          type: 'SUB_COMMAND',
          options: [number_one, number_two, bet],
      ***REMOVED***
        {
          name: 'street',
          description:
            'Bet on three distinct consecutive numbers in a horizontal line.',
          type: 'SUB_COMMAND',
          options: [number_one, number_two, number_three, bet],
      ***REMOVED***
        {
          name: 'corner',
          description: 'Bet on four numbers that meet at one corner.',
          type: 'SUB_COMMAND',
          options: [number_one, number_two, number_three, number_four, bet],
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
            bet,
          ],
      ***REMOVED***
        {
          name: 'trio',
          description: 'A three-number bet that involves at least one zero.',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'choice',
              description: 'Choose triangle.',
              type: 'STRING',
              required: true,
              choices: [
                {
                  name: '0-1-2',
                  value: '0-1-2',
              ***REMOVED***
                {
                  name: '0-2-3',
                  value: '0-2-3',
              ***REMOVED***
              ],
          ***REMOVED***
            bet,
          ],
      ***REMOVED***
        {
          name: 'first_four',
          description: 'Bet on 0-1-2-3.',
          type: 'SUB_COMMAND',
          options: [bet],
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
            bet,
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
            bet,
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
            bet,
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
            bet,
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
            bet,
          ],
      ***REMOVED***
        {
          name: 'snake',
          description:
            'A special bet that covers the numbers 1, 5, 9, 12, 14, 16, 19, 23, 27, 30, 32, and 34.',
          type: 'SUB_COMMAND',
          options: [bet],
      ***REMOVED***
      ],
  ***REMOVED***
  ], //https://crescent.edu/post/the-basic-rules-of-roulette
  async run(interaction, guild, author, options) {
    let color = 'GREEN',
      title = author.user.username,
      icon_url = author.user.displayAvatarURL(),
      description = '',
      bet;
    const cSymbol = await util.getCurrencySymbol(guild.id);
    const { wallet } = await util.getEconInfo(guild.id, author.user.id);
    const ballPocket =
      options._group === 'inside'
        ? Math.floor(Math.random() * 36 + 1)
        : Math.floor(Math.random() * 37 + 1);
    const nums = [];
    for (const option of options._hoistedOptions) {
      if (
        [
          'number_one',
          'number_two',
          'number_three',
          'number_four',
          'number_five',
          'number_six',
        ].includes(option.name)
      ) {
        if (option.value < 0 || option.value > 36) {
          color = 'RED';
          description += `Invalid \`${option.name}\`: \`${option.value}\`\n`;
        } else {
          nums.push(option.value);
        }
      }

      if (option.name === 'bet') {
        if (bet < 0 || bet > wallet) {
          color = 'RED';
          description += `Insufficient wallet: ${cSymbol}${wallet.toLocaleString()}\n`;
        } else {
          bet = option.value;
        }
      }
    }

    if (description.length) {
      interaction.reply({
        embeds: [util.embedify(color, title, icon_url, description)],
      });
      return;
    }

    description += `The ball landed on \`${ballPocket}\`\n`;

    if (options._subcommand === 'single') {
      if (nums[0] === ballPocket) {
        bet *= 4;
        description += `You won ${cSymbol}${bet.toLocaleString()}`;
      } else {
        color = 'RED';
        description += `You lost ${cSymbol}${bet.toLocaleString()}`;
        bet *= -1;
      }
    } else if (options._subcommand === 'split') {
      if (
        nums[0] != nums[1] &&
        (Math.abs(nums[0] - nums[1]) === 1 || Math.abs(nums[0] - nums[1]) === 3)
      ) {
        if (nums[0] === ballPocket || nums[1] === ballPocket) {
          bet *= 4;
          description += `You won ${cSymbol}${bet.toLocaleString()}`;
        } else {
          color = 'RED';
          description += `You lost ${cSymbol}${bet.toLocaleString()}`;
          bet *= -1;
        }
      } else {
        color = 'RED';
        description = `Incorrect format.\n\`${this.options[0].options[1].description}\``;
      }
    } else if (options._subcommand === 'street') {
      if (
        nums[0] % 3 === 1 &&
        nums[0] != nums[1] &&
        nums[1] != nums[2] &&
        nums[0] != nums[2] &&
        Math.abs(nums[0] - nums[1]) === 1 &&
        Math.abs(nums[2] - nums[1]) === 1
      ) {
        if (
          nums[0] === ballPocket ||
          nums[1] === ballPocket ||
          nums[2] === ballPocket
        ) {
          bet *= 4;
          description += `You won ${cSymbol}${bet.toLocaleString()}`;
        } else {
          color = 'RED';
          description += `You lost ${cSymbol}${bet.toLocaleString()}`;
          bet *= -1;
        }
      } else {
        color = 'RED';
        description = `Incorrect format.\n\`${this.options[0].options[2].description}\``;
      }
    } else if (options._subcommand === 'corner') {
      if (
        nums[1] - nums[0] === 1 &&
        nums[3] - nums[2] === 1 &&
        nums[2] - nums[1] === 2
      ) {
        if (
          nums[0] === ballPocket ||
          nums[1] === ballPocket ||
          nums[2] === ballPocket ||
          nums[3] === ballPocket
        ) {
          bet *= 4;
          description += `You won ${cSymbol}${bet.toLocaleString()}`;
        } else {
          color = 'RED';
          description += `You lost ${cSymbol}${bet.toLocaleString()}`;
          bet *= -1;
        }
      } else {
        color = 'RED';
        description = `Incorrect format.\n\`${this.options[0].options[3].description}\``;
      }
    } else if (options._subcommand === 'double_street') {
      if (
        nums[0] % 3 === 1 &&
        nums[0] + 1 === nums[1] &&
        nums[1] + 1 === nums[2] &&
        nums[2] + 1 === nums[3] &&
        nums[3] + 1 === nums[4] &&
        nums[4] + 1 === nums[5]
      ) {
        if (
          nums[0] === ballPocket ||
          nums[1] === ballPocket ||
          nums[2] === ballPocket ||
          nums[3] === ballPocket ||
          nums[4] === ballPocket ||
          nums[5] === ballPocket
        ) {
          bet *= 4;
          description += `You won ${cSymbol}${bet.toLocaleString()}`;
        } else {
          color = 'RED';
          description += `You lost ${cSymbol}${bet.toLocaleString()}`;
          bet *= -1;
        }
      } else {
        color = 'RED';
        description = `Incorrect format.\n\`${this.options[0].options[4].description}\``;
      }
    } else if (options._subcommand === 'trio') {
      if (options._hoistedOptions === '0-1-2') {
        nums[0] = 0;
        nums[1] = 1;
        nums[2] = 2;
      } else {
        nums[0] = 0;
        nums[1] = 2;
        nums[2] = 3;
      }
      if (
        nums[0] === ballPocket ||
        nums[1] === ballPocket ||
        nums[2] === ballPocket
      ) {
        bet *= 4;
        description += `You won ${cSymbol}${bet.toLocaleString()}`;
      } else {
        color = 'RED';
        description += `You lost ${cSymbol}${bet.toLocaleString()}`;
        bet *= -1;
      }
    } else if (options._subcommand === 'first_four') {
      if (ballPocket >= 0 && ballPocket <= 3) {
        bet *= 4;
        description += `You won ${cSymbol}${bet.toLocaleString()}`;
      } else {
        color = 'RED';
        description += `You lost ${cSymbol}${bet.toLocaleString()}`;
        bet *= -1;
      }
    } else if (options._subcommand === 'half') {
      if (
        (options._hoistedOptions[0].value === 'low' && ballPocket <= 18) ||
        ballPocket > 18
      ) {
        bet *= 4;
        description += `You won ${cSymbol}${bet.toLocaleString()}`;
      } else {
        color = 'RED';
        description += `You lost ${cSymbol}${bet.toLocaleString()}`;
        bet *= -1;
      }
    } else if (options._subcommand === 'color') {
      if (
        (options._hoistedOptions[0].value === 'red' && ballPocket % 2 === 0) ||
        ballPocket % 2 === 1
      ) {
        bet *= 4;
        description += `You won ${cSymbol}${bet.toLocaleString()}`;
      } else {
        color = 'RED';
        description += `You lost ${cSymbol}${bet.toLocaleString()}`;
        bet *= -1;
      }
    } else if (options._subcommand === 'even_or_odd') {
      if (
        (options._hoistedOptions[0].value === 'even' && ballPocket % 2 === 0) ||
        ballPocket % 2 === 1
      ) {
        bet *= 4;
        description += `You won ${cSymbol}${bet.toLocaleString()}`;
      } else {
        color = 'RED';
        description += `You lost ${cSymbol}${bet.toLocaleString()}`;
        bet *= -1;
      }
    } else if (options._subcommand === 'dozen') {
      if (
        (options._hoistedOptions[0].value === 'first' && ballPocket <= 12) ||
        (options._hoistedOptions[0].value === 'second' &&
          ballPocket > 12 &&
          ballPocket <= 24) ||
        (options._hoistedOptions[0].value === 'third' &&
          ballPocket > 25 &&
          ballPocket <= 36)
      ) {
        bet *= 4;
        description += `You won ${cSymbol}${bet.toLocaleString()}`;
      } else {
        color = 'RED';
        description += `You lost ${cSymbol}${bet.toLocaleString()}`;
        bet *= -1;
      }
    } else if (options._subcommand === 'column') {
      if (
        (options._hoistedOptions[0].value === 'first' &&
          ballPocket % 3 === 1) ||
        (options._hoistedOptions[0].value === 'second' &&
          ballPocket % 3 === 2) ||
        (options._hoistedOptions[0].value === 'third' && ballPocket % 3 === 0)
      ) {
        bet *= 4;
        description += `You won ${cSymbol}${bet.toLocaleString()}`;
      } else {
        color = 'RED';
        description += `You lost ${cSymbol}${bet.toLocaleString()}`;
        bet *= -1;
      }
    } else if (options._subcommand === 'snake') {
      if ([1, 5, 9, 12, 14, 16, 19, 23, 27, 30, 32, 34].includes(ballPocket)) {
        bet *= 4;
        description += `You won ${cSymbol}${bet.toLocaleString()}`;
      } else {
        color = 'RED';
        description += `You lost ${cSymbol}${bet.toLocaleString()}`;
        bet *= -1;
      }
    }

    if (!description.includes('format')) {
      await util.transaction(
        guild.id,
        author.user.id,
        this.name,
        description,
        bet,
        0,
        bet
      );
    }

    await interaction.reply({
      embeds: [util.embedify(color, title, icon_url, description)],
    });
***REMOVED***
};
