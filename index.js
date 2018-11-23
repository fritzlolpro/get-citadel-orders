require("dotenv").config();
const Order = require("./ordersSucker");
const writeJsonToFile = require("./fileWriter");
const { goonDB, forgeDB } = require("./dbConnector");

const comparePrices = async () => {
	const goonOrders = Array.from(await goonDB.find({}));
	const goonOrderIdList = Array.from(
		new Set(goonOrders.map(x => x.order.typeId))
	);

	const query = {
		"order.typeId": { $nin: goonOrderIdList }
	};

	const forgeOrders = await forgeDB.find(query);

	// 1. group all orders with same type ID

	const orderMerger = orders => {
		// !!! FUCK PIPELINES, DONT NEED THEM AS I CAN O(n) THIS SHIT
		let separatedOrders = {};
		let existingItemsKeys = [];

		orders.forEach(item => {
			const order = item.order;

			if (existingItemsKeys.includes(order.typeId)) {
				separatedOrders[order.typeId][order.body.isBuy ? "buy" : "sell"]
					? separatedOrders[order.typeId][order.body.isBuy ? "buy" : "sell"][
							"price"
					  ].push(order.body.price)
					: (separatedOrders[order.typeId][
							order.body.isBuy ? "buy" : "sell"
					  ] = { price: [order.body.price] });
			} else {
				separatedOrders[order.typeId] = {};
				separatedOrders[order.typeId][order.body.isBuy ? "buy" : "sell"] = {
					price: [order.body.price]
				};
			}
			existingItemsKeys.push(order.typeId);
		});
		// console.log(separatedOrders);
		return new Map(Object.entries(separatedOrders));
	};

	// 2. in every order balance prices
	const compareByExponent = (num1, num2) => num1 * 10 > num2;

	const cutTooSmall = prices =>
		prices
			.sort((a, b) => a - b)
			.map((price, i, arr) => {
				if (compareByExponent(price, arr[arr.length - 1])) {
					arr[arr.length - 1] = "";
				}
				return price;
			});

	const cutTooBig = prices =>
		prices
			.sort((a, b) => b - a)
			.map((price, i, arr) => {
				if (compareByExponent(price, arr[arr.length - 1])) {
					arr[i] = "";
				}
				return price;
			});

	// todo separate function for merging

	let normalizedOrders = orderMerger(goonOrders);
	normalizedOrders.forEach(order => {
		// console.log(order);
		if (order.sell) {
			order.sell =
				order.sell.price.length > 1
					? cutTooBig(order.sell.price)
					: order.sell.price[0];
		}
		if (order.buy) {
			order.buy =
				order.buy.price.length > 1
					? cutTooSmall(order.buy.price)
					: order.buy.price[0];
		}
	});
	console.log(normalizedOrders);
};

const GoonHome = {
	placeId: 1022734985679,
	name: "Delve"
};

const Forge = {
	placeId: 10000002,
	name: "Forge",
	queryModificator: "/orders"
};

const structuresCallUrl = "https://esi.tech.ccp.is/latest/markets/structures/";
const regionCallUrl = "https://esi.evetech.net/latest/markets/";

// const goonOrders = new Order()
// goonOrders.structure = GoonHome;
// goonOrders
//     .getPriceData()
//     .then((data) => {
//         writeJsonToFile(data, GoonHome)
//     })

// const ForgeOrders = new Order()
// ForgeOrders.structure = Forge
// ForgeOrders.callUrl = regionCallUrl
// ForgeOrders
//     .getPriceData()
//     .then((data) => {
//         writeJsonToFile(data, Forge)

//     })

comparePrices();
