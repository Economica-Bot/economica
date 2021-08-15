const transactionSchema = require('@schemas/transaction-sch');

module.exports = {
  name: 'statistics',
  group: 'statistics',
  description: 'View statistics.',
  format: '<balance>',
  global: true,
  options: [
    {
      name: 'balance',
      description: 'Balance',
      type: 1,
      options: [
        {
          name: 'user',
          description: 'Specify a user.',
          type: 6,
          required: true,
      ***REMOVED***
      ],
  ***REMOVED***
  ],
  async run(interaction, guild, author, options) {
    const user = options._hoistedOptions[0].user;

    const transactions = await transactionSchema.find({
      guildID: guild.id,
      userID: user.id,
    });

    let wallet = 0,
      treasury = 0,
      networth = 0;
    const wallets = [],
      treasuries = [],
      networths = [],
      dates = [];
    wallets.push(wallet);
    treasuries.push(treasury);
    networths.push(networth);
    for (const transaction of transactions) {
      wallet += transaction.wallet;
      treasury += transaction.treasury;
      networth += transaction.networth;
      wallets.push(wallet);
      treasuries.push(treasury);
      networths.push(networth);
      dates.push(transaction.createdAt.toLocaleDateString());
    }

    wallets.push(wallet);
    treasuries.push(treasury);
    networths.push(networth);
    dates.push(new Date().toLocaleDateString());

    const data = {
      labels: dates,
      datasets: [
        {
          label: 'Wallet',
          data: wallets,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, .5)',
          borderWidth: '3',
          tension: 0,
          pointRadius: 0,
      ***REMOVED***
        {
          label: 'Treasury',
          data: treasuries,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, .5)',
          borderWidth: '3',
          tension: 0,
          pointRadius: 0,
      ***REMOVED***
        {
          label: 'Networth',
          data: networths,
          borderColor: 'rgb(255, 205, 86)',
          backgroundColor: 'rgba(255, 205, 86, .5)',
          borderWidth: '3',
          tension: 0,
          pointRadius: 0,
      ***REMOVED***
      ],
    };

    const opt = {
      title: {
        display: true,
        text: `${user.username}`,
        fontSize: 20,
        fontColor: 'white',
    ***REMOVED***
      legend: {
        labels: {
          fontSize: 16,
          fontColor: 'white',
      ***REMOVED***
    ***REMOVED***
      scales: {
        xAxes: [
          {
            ticks: {
              fontSize: 14,
              fontColor: 'white',
              maxRotation: 0,
              minRotation: 0,
              maxTicksLimit: 5,
          ***REMOVED***
            scaleLabel: {
              display: true,
              labelString: 'Date',
              fontSize: 14,
              fontColor: 'white',
          ***REMOVED***
            gridLines: {
              display: false,
          ***REMOVED***
        ***REMOVED***
        ],
        yAxes: [
          {
            ticks: {
              fontSize: 14,
              fontColor: 'white',
          ***REMOVED***
            scaleLabel: {
              display: true,
              labelString: 'Balance',
              fontSize: 16,
              fontColor: 'white',
          ***REMOVED***
            gridLines: {
              display: false,
          ***REMOVED***
        ***REMOVED***
        ],
    ***REMOVED***
    };

    const QuickChart = require('quickchart-js');

    const chart = new QuickChart()
      .setConfig({
        type: 'line',
        data,
        options: opt,
      })
      .setWidth(600)
      .setHeight(450)
      .setBackgroundColor('transparent');

    const url = await chart.getShortUrl();
    const embed = util
      .embedify(
        'GOLD',
        `Statistics for ${user.username}`,
        user.displayAvatarURL(),
        `Total transactions: \`${transactions.length}\``
      )
      .setImage(url)
      .setFooter(url);

    await interaction.reply({ embeds: [embed] });
***REMOVED***
};
