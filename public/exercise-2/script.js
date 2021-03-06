//Exercise 2: an exercise that demonstrates how different modules might interact with a central crossfilter object and between each other

var m = {t:85,r:100,b:50,l:100},
	w = document.getElementById('plot1').clientWidth - m.l - m.r,
	h = document.getElementById('plot1').clientHeight - m.t - m.b;
var plots = d3.selectAll('.plot');
var plot1 = plots.filter(function(d,i){ return i===0;}),
	plot2 = plots.filter(function(d,i){return i===1}),
	plot3 = plots.filter(function(d,i){return i===2});

var colorRamp = ['red','gray','blue'];

d3.queue()
	.defer(d3.csv,'../data/hubway_trips_reduced.csv',parseTrips)
	.defer(d3.csv,'../data/hubway_stations.csv',parseStations)
	.await(dataLoaded);

function dataLoaded(err,trips,stations){
	//Create crossfilter and dimensions
	var cf = crossfilter(trips);
	var tripsByTimeOfDay 	= cf.dimension(function(d){return d.startTime.getHours() + d.startTime.getMinutes()/60}),
		tripsByGender 		= cf.dimension(function(d){return d.userGender}),
		tripsByUserType 	= cf.dimension(function(d){return d.userType});

	drawTimeOfDay(tripsByTimeOfDay.top(Infinity), plot1, tripsByTimeOfDay);
	drawUserType(tripsByTimeOfDay.top(Infinity), plot2);
	drawUserGender(tripsByTimeOfDay.top(Infinity), plot3);
//Question: drawTimeOfDay(tripsByTimeOfDay.top(Infinity), plot1, tripsByTimeOfDay);

}

function drawTimeOfDay(arr,div,dimension){
	//calculate w, h; append <svg> and <g> for plot area
	var w = div.node().clientWidth - m.l - m.r,
		h = div.node().clientHeight - m.t - m.b;
	var plot = div
		.append('svg')
		.attr('width', w + m.l + m.r)
		.attr('height', h + m.t + m.b)
		.append('g')
		.attr('class','canvas time-series')
		.attr('transform','translate('+m.l+','+m.t+')');

	//Use histogram to transform data
	var histogramTime = d3.histogram()
		.domain([0,24])
		.value(function(d){return d.startTime.getHours() + d.startTime.getMinutes()/60})
		.thresholds(d3.range(0,24.1,1/6));
	var binTimeOfDay = histogramTime(arr)
		.map(function(bin){
			bin.pct = bin.length/arr.length
			return bin;
		});

	//Use line and area graph to represent trips during time of the day
	//normalized by the total number of trips
	var scaleX = d3.scaleLinear().domain([0,24]).range([0,w]),
		scaleY = d3.scaleLinear().domain([0,.03]).range([h,0]);
	var line = d3.line()
		.x(function(d){return scaleX(d.x0)})
		.y(function(d){return scaleY(d.pct)});
	var area = d3.area()
		.x(function(d){return scaleX(d.x0)})
		.y0(function(d){return h})
		.y1(function(d){return scaleY(d.pct)});
	var axisX = d3.axisBottom()
		.scale(scaleX)
		.tickValues(d3.range(0,24.1,.5))
		.tickFormat(function(tickValue){
			var leading0 = d3.format('02');
			var hour = Math.floor(tickValue),
				minute = Math.floor((tickValue-hour)*60);
			return hour+':'+leading0(minute);
		});
	var axisY = d3.axisLeft()
		.scale(scaleY)
		.ticks(5)
		.tickFormat(d3.format('.1%'))
		.tickSize(-w);

	//Represent
	plot.append('path').attr('class','area')
		.datum(binTimeOfDay)
		.attr('d',area);
	plot.append('g').attr('class','axis axis-y')
		.call(axisY);
	plot.append('path').attr('class','line')
		.datum(binTimeOfDay)
		.attr('d',line);
	var axisXNode = plot.append('g').attr('class','axis axis-x')
		.attr('transform','translate(0,'+h+')')
		.call(axisX);
	axisXNode.selectAll('.tick').selectAll('text')
		.attr('transform','rotate(45)translate(10,0)');

	//Create a brush
	//Refer to API here: https://github.com/d3/d3-brush
	var brush = d3.brushX()
		.on('end',brushend)

	plot.append('g').attr('class','brush')
		.call(brush);

	function brushend(){
		console.log('timeseries:brushend');
		if(!d3.event.selection){
			//if brush is cleared, then selected range will be empty
			console.log('brush is cleared');
			return;
		}
		console.log('selected range of the brush (in terms of screen pixels) is ' + d3.event.selection);
		console.log('selected range of the brush (in terms of time of day) is ' + d3.event.selection.map(scaleX.invert));

/*		Exercise 2 part 1:
		With the selected range of the brush, update the crossfilter
		and then update the userType and userGender pie charts

*/	
	var brushTime = d3.event.selection.map(scaleX.invert);
	dimension.filter(brushTime);
	drawUserType(dimension.top(Infinity),plot2);
	drawUserGender(dimension.top(Infinity),plot3);
}

}

function drawUserType(arr,div){
	var w = div.node().clientWidth - m.l - m.r,
		h = div.node().clientHeight - m.t - m.b;


	//Transform data
	var tripsByUserType = d3.nest()
		.key(function(d){return d.userType})
		.rollup(function(leaves){return leaves.length})
		.entries(arr);
	console.log(tripsByUserType);

	//Further transform data to ready it for a pie layout
	var pie = d3.pie()
		.value(function(d){return d.value});
	console.log( pie(tripsByUserType) );
	var arc = d3.arc()
		.innerRadius(5)
		.outerRadius(Math.min(w,h)/2);

	//Draw
/*	Exercise 2 part 2: this part of the code does not account for the update and exit sets
	Refractor this code to account for the update and exit sets
*/	

	var svg = div.selectAll('svg').data([1]);
	var svgEnter = svg.enter().append('svg')
		.attr('width', w + m.l + m.r)
		.attr('height', h + m.t + m.b)
		.append('q')
		.attr('class','canvas')
		.attr('transform','translate('+m.l+','+m.t+')');


	var chartEnter = svgEnter.append('g').attr('class', 'pie-chart')
		.attr('transform','translate(' +w/2+ ',' +h/2+ ')' );






	var slices = svgEnter.merge(svg).select('.pie-chart')
		.selectAll('.slice')
		.data( pie(tripsByUserType) );

	var slicesEnter = slices.enter()
		.append('g').attr('class','slice');

	slicesEnter.append('path');
	slicesEnter.append('text');
	
	slicesEnter.merge(slices).select('path')
		.transition()
		.attr('d',arc)
		.style('fill', function(d,i){return colorRamp[i%2]});

	slicesEnter.merge(slices).select('text')
		.text(function(d){return d.data.key})
        .attr('transform',function(d){
            var angle = (d.startAngle+d.endAngle)*180/Math.PI/2 - 90;
            return 'rotate('+angle+')translate('+((Math.min(w,h)/2)+20)+')';
        });
}

/*	Exercise 2 part 3: can you complete the user gender pie chart? */

function drawUserGender(arr,div){
	var w = div.node().clientWidth - m.l - m.r,
		h = div.node().clientHeight - m.t - m.b;

	var tripsByUserGender = d3.nest()
		.key(function(d) {return d.userGender})
		.rollup(function(leaves){return leaves.length})
		.entries(arr);
	console.log(tripsByUserGender);

	var pie = d3.pie()
				.value(function(d){return d.value});
	console.log(pie(tripsByUserGender));

	var arc = d3.arc()
				.innerRadius(5)
				.outerRadius(Math.min(w,h)/2);

	var svg = div.selectAll('svg').data([1]);
	var svgEnter = svg.enter().append('svg')
					.attr('width', w + m.l + m.r)
					.attr('height', h + m.t + m.b)
					.append('g')
					.attr('class','canvas')
					.attr('transform','translate('+m.l+','+m.t+')');

	var chartEnter = svgEnter.append('g')
							.attr('class','pie-chart')
							.attr('transform','translate('+w/2+','+h/2+')');

	var slices = svgEnter.merge(svg).select('.pie-chart')
            .selectAll('.slice')
            .data( pie(tripsByUserGender) );
 
    var slicesEnter = slices.enter()
            .append('g').attr('class','slice'); 
 
        slicesEnter.append('path');
        slicesEnter.append('text');

 
        slicesEnter.merge(slices).select('path')
            .transition()
            .attr('d',arc)
            .style('fill',function(d,i){return colorRamp[i%3];});
 
        slicesEnter.merge(slices).select('text')
            .text(function(d){return d.data.key})
            .attr('transform',function(d){
                var angle = (d.startAngle+d.endAngle)*180/Math.PI/2 - 90;
                return 'rotate('+angle+')translate('+((Math.min(w,h)/2)+20)+')';
            });

}

function parseTrips(d){
	return {
		bike_nr:d.bike_nr,
		duration:+d.duration,
		startStn:d.strt_statn,
		startTime:parseTime(d.start_date),
		endStn:d.end_statn,
		endTime:parseTime(d.end_date),
		userType:d.subsc_type,
		userGender:d.gender?d.gender:undefined,
		userBirthdate:d.birth_date?+d.birth_date:undefined
	}
}

function parseStations(d){
	return {
		id:d.id,
		lngLat:[+d.lng,+d.lat],
		city:d.municipal,
		name:d.station,
		status:d.status,
		terminal:d.terminal
	}
}

function parseTime(timeStr){
	var time = timeStr.split(' ')[1].split(':'),
		hour = +time[0],
		min = +time[1],
		sec = +time[2];

	var	date = timeStr.split(' ')[0].split('/'),
		year = date[2],
		month = date[0],
		day = date[1];

	return new Date(year,month-1,day,hour,min,sec);
}
