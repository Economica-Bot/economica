const ms = require('ms');

const loanSchema = require('@schemas/loan-sch');

module.exports = {
  name: 'loan',
  group: 'economy',
  description: 'Loan money to other users.',
  format: '<propose | cancel | accept | decline | view> [...options]',
  global: true,
  roles: [
    {
      name: 'ECONOMY MANAGER',
      required: false,
  ***REMOVED***
  ],
  options: [
    {
      name: 'propose',
      description: 'Add a loan to the registry',
      type: 1,
      options: [
        {
          name: 'user',
          description: 'Specify a user.',
          type: 6,
          required: true,
      ***REMOVED***
        {
          name: 'principal',
          description: 'Specify the principal.',
          type: 4,
          required: true,
      ***REMOVED***
        {
          name: 'repayment',
          description: 'Specify the repayment.',
          type: 4,
          required: true,
      ***REMOVED***
        {
          name: 'length',
          description: 'Specify the life of the loan.',
          type: 3,
          required: true,
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'cancel',
      description: 'Cancel a pending loan in the registry.',
      type: 1,
      options: [
        {
          name: 'loan_id',
          description: 'Specify a loan.',
          type: 3,
          required: true,
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'accept',
      description: 'Accept a pending loan in the registry.',
      type: 1,
      options: [
        {
          name: 'loan',
          description: 'Specify a loan.',
          type: 3,
          required: true,
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'decline',
      description: 'Decline a pending loan in the registry.',
      type: 1,
      options: [
        {
          name: 'loan',
          description: 'Specify a loan.',
          type: 3,
          required: true,
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'view',
      description: 'View the loan registry.',
      type: 1,
      options: [
        {
          name: 'loan',
          description: 'Specify a loan.',
          type: 3,
          required: false,
      ***REMOVED***
      ],
  ***REMOVED***
  ],

  async run(interaction, guild, author, options) {
    const guildID = guild.id;

    let color = 'BLURPLE',
      title = author.user.username,
      icon_url = author.user.displayAvatarURL(),
      description = '',
      footer = '';

    const cSymbol = await util.getCurrencySymbol(guild.id);
    const { wallet } = await util.getEconInfo(guild.id, author.user.id);

    if (options._subcommand === 'propose') {
      const member = options._hoistedOptions[0].member;
      const principal = options._hoistedOptions[1].value;
      const repayment = options._hoistedOptions[2].value;
      const length = options._hoistedOptions[3].value;

      //Validation
      if (member.user.id === author.user.id) {
        (color = 'RED'), (description += 'You cannot give yourself a loan!\n');
      }
      if (principal < 1 || repayment < 1) {
        color = 'RED';
        description += `${loan < 1 ? `Invalid loan: ${cSymbol}${loan}\n` : ''}
        ${repayment < 1 ? `Invalid repayment: ${cSymbol}${repayment}\n` : ''}`;
      } else if (principal > wallet) {
        color = 'RED';
        description += `Insufficient wallet: ${cSymbol}${principal.toLocaleString()}\nCurrent wallet: ${cSymbol}${wallet.toLocaleString()}`;
      }
      if (!ms(length)) {
        color = 'RED';
        description += `Invalid length: \`${length}\`\nExamples: \`\`\`2 hours\n1h\n1m\n20m10s\n100\`\`\`\n`;
        footer = 'Number is measured in ms';
      }

      //Exit if invalid parameter
      if (color === 'RED') {
        interaction.reply({
          embeds: [util.embedify(color, title, icon_url, description, footer)],
          ephemeral: true,
        });

        return;
      }

      //Create loan schema - to be handled in a dedicated feature
      const loan = await new loanSchema({
        guildID,
        borrowerID: member.user.id,
        lenderID: author.user.id,
        principal,
        repayment,
        expires: new Date(new Date().getTime() + ms(length)),
        pending: true,
        active: true,
        complete: false,
      }).save();

      //Execute principal transaction
      await util.transaction(
        guild.id,
        author.user.id,
        this.name,
        `Loan to <@!${member.user.id}> | Loan ID \`${loan._id}\``,
        -principal,
        0,
        -principal
      );

      color = 'GREEN';
      description = `Successfully created a loan.\nLoan ID: \`${loan._id}\`\n\`\`\`\n${loan}\`\`\``;
    } else if (options._subcommand === 'cancel') {
      const _id = options._hoistedOptions[0].value;

      const econManagerRole = guild.roles.cache.find((r) => {
        return r.name.toLowerCase() === 'economy manager';
      });

      let loan;
      if (author.roles.cache.has(econManagerRole.id)) {
        loan = await loanSchema.findOneAndDelete({
          _id,
        });
      } else {
        loan = await loanSchema.findOneAndDelete({
          _id,
          userID: author.user.id,
        });
      }

      if (loan) {
        color = 'GREEN';
        description = `Successfully deleted loan.\nLoan ID: \`${loan._id}\``;
      } else {
        color = 'RED';
        description = `Could not find loan with id \`${_id}\``;
      }
    } else if (options._subcommand === 'accept') {
      const _id = options._hoistedOptions[0].value;
      const loan = await loanSchema.findOneAndUpdate(
        {
          _id,
          borrowerID: author.user.id,
          pending: true,
      ***REMOVED***
        {
          pending: false,
        }
      );

      if (loan) {
        color = 'GREEN';
        description = `Successfully accepted loan.\nLoad ID: \`${loan._id}\``;

        await util.transaction(
          guild.id,
          author.user.id,
          this.name,
          `Loan from <@!${member.user.id}> | Loan ID: \`${loan._id}\``,
          principal,
          0,
          principal
        );
      } else {
        color = 'RED';
        description = `Could not find loan with id \`${_id}\``;
      }
    } else if (options._subcommand === 'decline') {
      const _id = options._hoistedOptions[0].value;
      const loan = await loanSchema.findOneAndUpdate(
        {
          _id,
          borrowerID: author.user.id,
          pending: true,
      ***REMOVED***
        {
          pending: false,
          active: false,
        }
      );

      if (loan) {
        color = 'GREEN';
        description = `Successfully declined loan.\nLoan ID: \`${loan._id}\``;
      } else {
        color = 'RED';
        description = `Could not find loan with id \`${_id}\``;
      }
    } else if (options._subcommand === 'view') {
      color = 'GREEN';
      const outgoingLoans = await loanSchema.find({
        guildID: guild.id,
        lenderID: author.user.id,
      });

      const incomingLoans = await loanSchema.find({
        guildID: guild.id,
        borrowerID: author.user.id,
      });

      for (const outgoingLoan of outgoingLoans) {
        description += `Outgoing Loan \`${
          outgoingLoan._id
        }\`\nExpires ${outgoingLoan.expires.toLocaleString()}\nBorrower: <@!${
          outgoingLoan.borrowerID
        }>\nPending: \`${outgoingLoan.pending}\` | Active: \`${
          outgoingLoan.active
        }\` | Complete: \`${outgoingLoan.active}\`\nPrincipal: ${cSymbol}${
          outgoingLoan.principal
        } | Repayment: ${cSymbol}${outgoingLoan.repayment}`;
      }

      for (const incomingLoan of incomingLoans) {
        description += `Outgoing Loan \`${
          incomingLoan._id
        }\`\nExpires ${incomingLoan.expires.toLocaleString()}\nBorrower: <@!${
          incomingLoan.borrowerID
        }>\nPending: \`${incomingLoan.pending}\` | Active: \`${
          incomingLoan.active
        }\` | Complete: \`${incomingLoan.active}\`\nPrincipal: ${cSymbol}${
          incomingLoan.principal
        } | Repayment: ${cSymbol}${incomingLoan.repayment}`;
      }

      if (description.length === 0) {
        description = `NO LOANS`;
      }
    }

    embed = util.embedify(
      color,
      author.user.username,
      author.user.displayAvatarURL(),
      description
    );

    interaction.reply({ embeds: [embed] });
***REMOVED***
};
