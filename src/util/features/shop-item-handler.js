const shopItemSchema = require('@schemas/shop-item-sch');

module.exports = () => {
  const checkActive = async () => {
    const now = new Date();
    const conditional = {
      active: true,
      duration: {
        $ne: null,
    ***REMOVED***
    };

    const results = await shopItemSchema.find(conditional);

    if (results?.length) {
      for (const result of results) {
        const { duration, createdAt } = result;
        if (createdAt.getTime() + duration < now.getTime()) {
          await shopItemSchema.findOneAndUpdate(
            {
              name: result.name,
          ***REMOVED***
            {
              active: false,
            }
          );
        }
      }
    }

    //checks for expired items every 5 seconds
    setTimeout(checkActive, 1000 * 5);
  };

  checkActive()
};
