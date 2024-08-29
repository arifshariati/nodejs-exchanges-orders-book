## NodeJS and Typescript - Get exchanges orders book

Majority of trading platforms are connected to major exchanges around the world. The price offered at any certain point differs from exchange to exchange. The traders are not directly connected to exchanges rather via trading platforms.

Trading platforms can leverage from various price options available to them via exchanges orders book, during a certain trading activity and calculate price index delivered to their users.

### What we need?

As a trading platform, to calculate price index, we need a way to collect orders book from exchanges, perform required calculations and make it available to users.

> [!Note]
> The request for getting orders book from exchanges can be originated either by platform user or platform internal component or system.

### Technical flow

We need to expose a REST endpoint. Whenever the endpoint is hit, it goes and fetches orders book from various exchanges, prunes the incoming data, calculate price index and finally return the price index.

Orders book from exchanges can be received via REST API and web sockets endpoints. Below is step by step flow;

1. User hits REST endpoint
2. Once endpoint hit, server initiates parallel REST and Web Sockets calls to exchanges endpoints.
3. Once all the request to exchanges are finalized, the servers calculates price index.
4. Finally the endpoint returns price index to user or request originator.

### Tech Stack

I have developed the endpoint in `Node JS` and `Typescript` using [Nest JS](https://nestjs.com/). We used `Jest` for writing tests. Moreover, we have used `Axios` for `REST API` calls and `ws` for `web sockets` communications.

### Current implementation

I am supposed to focus working with predetermined exchanges such as [Binance](https://www.binance.com/en), [Kraken](https://www.kraken.com/) and [Huobi](https://www.htx.com/) (now called HTX). Below are list of endpoints and their respective response for above mentioned exchanges;

1. Binance (https://developers.binance.com/docs/binance-spot-api-docs/rest-api#order-book)
2. Kraken (https://docs.kraken.com/api/docs/rest-api/get-order-book)
3. Huobi (HTX) (https://www.htx.com/en-us/opend/newApiPages/?id=7ec5342e-7773-11ed-9966-0242ac110003)

The project exposes one `GET` endpoint `/prices/price-index`. The server fetch resources from Binance and Kraken hitting their REST endpoint using axios. The server uses web sockets in order to fetch resources from Huobi. Below is the list of points taken care of;

1. I have made sure that all promises are resolved. Moreover, for websockets we make sure to close the socket once we are done with our desired task.
2. It is natural that response data and its depth varies from exchange to exchange. I took the approach to generalize it with pattern mapper. So, we shall not worry about future addition of new exchanges. 🙂 Well of course we need to provide the `dataPath` for any new exchange.
3. Before going for `globalPriceIndex` calculation, we make sure required data for calculation is in correct format and data. This would help avoid unforeseen errors for future new exchanges addition.
4. we are generous enough 😉 and always return `200 status` to user/requester.

> [!Note]
> The idea behind always sending `200 status` to user/requester lies in the functions distributability for the future. We need not to go back to user/requester with Error if any of the exchanges got in trouble, rather we need to track bad responses and treat them to fix.

I have also added github workflows `CI.yml` 🙂

### Get started with project

You can clone the project and install dependencies;

```bash
npm i
```

here are commands you can make use of;

```bash
# start server in dev environment
npm run start:dev

# start server in production  environment (post deployment)
npm run start:prod

# Run tests and e2e tets
npm run test & npm run test:e2e

# Build project
npm run build

```

### That's it 🚀
I hope you have enjoyed going through the code base and this document was helpful. See you soon. 
