const DBManager = require("../db/DBManager");

async function getRecords(req, res) {
	const data = await DBManager.getRecordings();
	return res.json(data);
}

async function getRecordsStatistic(req, res) {
	const data = await DBManager.getRecordings();
	const result = [];
	data.forEach((record) => {
		const dtoRecord = {
			id: record._id,
			dateStart: record.dateStart,
			dateEnd: record.dateEnd,
			car: 0,
			bus: 0,
			truck: 0,
			bike: 0,
			person: 0,
			totalObjects: 0,
			totalItemsTracked: record.trackerSummary.totalItemsTracked || 0,
			totalAreas: Object.keys(record.areas).length,
		};

		Object.entries(record.counterSummary).forEach(([areaId, areaData]) => {
			dtoRecord.car += areaData.car || 0;
			dtoRecord.bus += areaData.bus || 0;
			dtoRecord.truck += areaData.trucks || 0;
		});
		dtoRecord.totalObjects = dtoRecord.car + dtoRecord.buse + dtoRecord.truck;
		countSpeed(record.counterHistory);

		result.push(dtoRecord);
	});

	return res.json(result);
}

function countSpeed(carsArray) {
	let carIdSet = new Set();
	carsArray.forEach((car) => {
		carIdSet.add(car.id);
	});
	const carIdArray = Array.from(carIdSet);
	const carsObj = {};
	carIdArray.forEach((id) => {
		const filteredCars = carsArray.filter((car) => car.id == id);
		carsObj[id] = filteredCars;
	});
  console.log('========== START =============');
  
	console.log(carsObj);
  console.log('INTITIAL LENGTH: ', carsArray.length);
  console.log('FILTERED LENGTH: ', Object.keys(carsObj).length);
  console.log('========== END =============');
  
}

module.exports = { getRecords, getRecordsStatistic };
