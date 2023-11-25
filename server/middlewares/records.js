const DBManager = require("../db/DBManager");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const DISTANCE = 20;

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
			averageSpeed: {
				car: 0,
				bus: 0,
				truck: 0,
			},
		};

		Object.entries(record.counterSummary).forEach(([areaId, areaData]) => {
			dtoRecord.car += areaData.car || 0;
			dtoRecord.bus += areaData.bus || 0;
			dtoRecord.truck += areaData.trucks || 0;
		});
		dtoRecord.totalObjects = dtoRecord.car + dtoRecord.bus + dtoRecord.truck;
		dtoRecord.averageSpeed = countSpeed(record.counterHistory);

		result.push(dtoRecord);
	});

	return res.json(result);
}
async function getCounterFile(req, res) {
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
			averageSpeed: {
				car: 0,
				bus: 0,
				truck: 0,
			},
		};

		Object.entries(record.counterSummary).forEach(([areaId, areaData]) => {
			dtoRecord.car += areaData.car || 0;
			dtoRecord.bus += areaData.bus || 0;
			dtoRecord.truck += areaData.trucks || 0;
		});
		dtoRecord.totalObjects = dtoRecord.car + dtoRecord.bus + dtoRecord.truck;
		dtoRecord.averageSpeed = countSpeed(record.counterHistory);

		result.push(dtoRecord);
	});

	const csvFormat = result.map((item) => {
		// return `${item.id};${item.car};${converSpeed(item.averageSpeed.car)};${item.truck};${converSpeed(item.averageSpeed.truck)};${item.bus};${converSpeed(item.averageSpeed.bus)}`;
		return {
			file_name: item.id,
			quantity_car: item.car,
			average_speed_car: converSpeed(item.averageSpeed.car),
			quantity_van: item.truck,
			average_speed_van: converSpeed(item.averageSpeed.truck),
			quantity_bus: item.bus,
			average_speed_bus: converSpeed(item.averageSpeed.bus),
		};
	});
	const csvWriter = createCsvWriter({
		path: "submission.csv",
		header: [
			{ id: "file_name", title: "file_name" },
			{ id: "quantity_car", title: "quantity_car" },
			{ id: "average_speed_car", title: "average_speed_car" },
			{ id: "quantity_van", title: "quantity_van" },
			{ id: "average_speed_van", title: "average_speed_van" },
			{ id: "quantity_bus", title: "quantity_bus" },
			{ id: "average_speed_bus", title: "average_speed_bus" },
		],
	});
	csvWriter.writeRecords(csvFormat).then(() => {
		return res.download("submission.csv");
	});
	// csvFormat.unshift("file_name;quantity_car;average_speed_car;quantity_van;average_speed_van;quantity_bus;average_speed_bus");
	// return res.csv(csvFormat, false, { "Content-disposition": `attachment; filename=counterData.csv` });
}

function converSpeed(speed) {
	return (parseFloat(speed) * 3.6).toFixed(1);
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
	const carTimes = [];
	const busTimes = [];
	const truckTimes = [];

	Object.entries(carsObj).forEach(([carId, carData]) => {
		if (carData.length > 1) {
			const minTimeCar = carData.reduce((min, current) => {
				const curDate = new Date(current.timestamp);
				const minDate = new Date(min.timestamp);
				return curDate.getTime() < minDate.getTime() ? current : min;
			}, carData[0]);

			const maxTimeCar = carData.reduce((max, current) => {
				const curDate = new Date(current.timestamp);
				const maxDate = new Date(max.timestamp);
				return curDate.getTime() > maxDate.getTime() ? current : max;
			}, carData[0]);

			const minDate = new Date(minTimeCar.timestamp);
			const maxDate = new Date(maxTimeCar.timestamp);
			const diff = (maxDate.getTime() - minDate.getTime()) / 1000;
			if (carData[0].name == "car") carTimes.push(diff);
			if (carData[0].name == "bus") busTimes.push(diff);
			if (carData[0].name == "truck") truckTimes.push(diff);
		}
	});

	const carSpeed = carTimes.map((time) => DISTANCE / time);
	const busSpeed = busTimes.map((time) => DISTANCE / time);
	const truckSpeed = truckTimes.map((time) => DISTANCE / time);

	return {
		car: carSpeed.reduce((a, b) => a + b, 0) / carSpeed.length || 0,
		bus: busSpeed.reduce((a, b) => a + b, 0) / busSpeed.length || 0,
		truck: truckSpeed.reduce((a, b) => a + b, 0) / truckSpeed.length || 0,
	};
}

module.exports = { getRecords, getRecordsStatistic, getCounterFile };
