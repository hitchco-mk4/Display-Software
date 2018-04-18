// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {ipcRenderer} = require('electron');

var Chart = require('chart.js')
var chartsjsPluginDataLabels = require("chartsjs-plugin-data-labels"); 

var mph_max = 200;
var rpm_max = 8000; 


function log_function (message) {
	console.log("renderer.js - " + String(message));
}

/*
	doughnut graph settings
*/

doughnut_ids = ["mph_doughnut", "rpm_doughnut"]; 
var doughnut_id_to_object = {};

var doughnut_options = {
		rotation: -Math.PI,
		cutoutPercentage: 75,
		circumference: Math.PI,
		segmentShowStroke : false, 
		elements: {
			center: {
				text: 'Value',
				color: '#36A2EB', //Default black
				fontStyle: 'Helvetica', //Default Arial
				sidePadding: 15 //Default 20 (as a percentage)
			}
		},
		legend: { display: false },
		showTooltips: false, // needed to disable user interaction
		events: [], // needed to disable user interaction
		animation: false,
};

var mph_doughnut_id = doughnut_ids[0];
var mph_doughnut_chart = new Chart(document.getElementById(mph_doughnut_id), {
    
	type: 'doughnut',
    
	data:	{
				datasets: [
					{
						data: [0, mph_max],
						backgroundColor: ["#FF6384", "#e6e6e6"],
					}
				]
		},
    
	options: doughnut_options

});
doughnut_id_to_object[mph_doughnut_id] = mph_doughnut_chart;

var rpm_doughnut_id = doughnut_ids[1];
var rpm_doughnut_chart = new Chart(document.getElementById(rpm_doughnut_id), {
    
	type: 'doughnut',
    
	data:	{
				datasets: [
					{
						data: [0, rpm_max],
						backgroundColor: ["#5063FF", "#e6e6e6"],
					}
				]
		},
    
	options: doughnut_options

});
doughnut_id_to_object[rpm_doughnut_id] = rpm_doughnut_chart;

/*
	bar graph settings
*/
function get_bar(element, min, max, y_axis_labels) {
	
	var bar_data = {
    datasets: [{
        backgroundColor: ['rgba(255, 99, 132, 0.2)'],
        borderColor: ['rgba(255,99,132,1)'],
        borderWidth: 1,
        data: [0],
		datalabels: {
			align: 'start',
			anchor: 'start'
		}
      }]
	};

	// display: false
	
	var fontSize;
	
	if (y_axis_labels) {
		fontSize = 12;
	}
	else {
		fontSize = 0;
	}
	
	var bar_options = {
		maintainAspectRatio: false,
		legend: { display: false },
		showTooltips: false, // needed to disable user interaction
		events: [], // needed to disable user interaction
		scales: {
			xAxes: [{
						gridLines: {
							display: true,
							drawBorder: true
						},
						categoryPercentage: 1.0,
						barPercentage: 1.0
					}],
			yAxes: [{
						gridLines: {
							display: false,
							drawBorder: false
						},
						ticks: {
							min:min,
							max:max,
							fontSize: fontSize // will hide the y axis labels
						}
					}]
		},
		
		layout: {
            padding: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            }
        },

		scaleShowLabels : false,
		scaleFontSize: 0,
		animation: false,
	}
	
	return new Chart(element, {
		type: 'bar',
		data: bar_data, 
		options: bar_options
	});
}

var bar_ids = ["fuel_bar", "vbat_bar", "batc_bar", "ect_bar", "act_bar", "oilp_bar", "egol_bar", "egor_bar"];
var bar_id_to_object = {};


/*
	Map from names to usable vars
*/

var fuel_bar_element_name = bar_ids[0];
var fuel_bar_element = document.getElementById(fuel_bar_element_name).getContext("2d");
var fuel_bar_chart = get_bar(fuel_bar_element, 0, 100, true);
bar_id_to_object[fuel_bar_element_name] = fuel_bar_chart;

var vbat_bar_element_name = bar_ids[1];
var vbat_bar_element = document.getElementById(vbat_bar_element_name).getContext("2d");
var vbat_bar_chart = get_bar(vbat_bar_element, 0, 20, true);
bar_id_to_object[vbat_bar_element_name] = vbat_bar_chart;

var batc_bar_element_name = bar_ids[2]; 
var batc_bar_element = document.getElementById(batc_bar_element_name).getContext("2d");
var batc_bar_chart = get_bar(batc_bar_element, 0, 8, true);
bar_id_to_object[batc_bar_element_name] = batc_bar_chart;

var ect_bar_element_name = bar_ids[3];
var ect_bar_element = document.getElementById(ect_bar_element_name).getContext("2d");
var ect_bar_chart = get_bar(ect_bar_element, 0, 300, true);
bar_id_to_object[ect_bar_element_name] = ect_bar_chart;

var act_bar_element_name = bar_ids[4];
var act_bar_element = document.getElementById(act_bar_element_name).getContext("2d");
var act_bar_chart = get_bar(act_bar_element, 0, 300, true);
bar_id_to_object[act_bar_element_name] = act_bar_chart;

var oilp_bar_element_name = bar_ids[5];
var oilp_bar_element = document.getElementById(oilp_bar_element_name).getContext("2d");
var oilp_bar_chart = get_bar(oilp_bar_element, 0, 100, true);
bar_id_to_object[oilp_bar_element_name] = oilp_bar_chart;

var egol_bar_element_name = bar_ids[6];
var egol_bar_element = document.getElementById(egol_bar_element_name).getContext("2d");
var egol_bar_chart = get_bar(egol_bar_element, 0, 2, true);
bar_id_to_object[egol_bar_element_name] = egol_bar_chart;

var egor_bar_element_name = bar_ids[7];
var egor_bar_element = document.getElementById(egor_bar_element_name).getContext("2d");
var egor_bar_chart = get_bar(egor_bar_element, 0, 2, true);
bar_id_to_object[egor_bar_element_name] = egor_bar_chart;

var npanel_reverse = document.getElementById("npanel_reverse");
var npanel_ebreak = document.getElementById("npanel_serror");
var npanel_state = document.getElementById("npanel_state");
var npanel_odo = document.getElementById("npanel_odo");

var left_blinker_corner = document.getElementById("top-left-triangle");
var right_blinker_corner = document.getElementById("top-right-triangle");


/*
	configure chartjs
*/

// this draws the text in the middle of the doughnut
 Chart.pluginService.register({
  beforeDraw: function (chart) {
    if (chart.config.options.elements.center) {
      
	  //Get ctx from string
      var ctx = chart.chart.ctx;

      //Get options from the center object in options
      var centerConfig = chart.config.options.elements.center;
      var fontStyle = centerConfig.fontStyle || 'Arial';
      var txt = centerConfig.text;
      var color = centerConfig.color || '#000';
      var sidePadding = centerConfig.sidePadding || 20;
      var sidePaddingCalculated = (sidePadding/100) * (chart.innerRadius * 2)
      //Start with a base font of 90px
      ctx.font = "75px " + fontStyle;

      //Get the width of the string and also the width of the element minus 10 to give it 5px side padding
      var stringWidth = ctx.measureText(txt).width;
	  var stringHeight = ctx.measureText(txt).height;
      var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

      // Find out how much the font can grow in width.
      var widthRatio = elementWidth / stringWidth;
      var newFontSize = Math.floor(30 * widthRatio);
      var elementHeight = (chart.innerRadius * 2);

      // Pick a new font size so it will not be larger than the height of label.
      var fontSizeToUse = Math.min(newFontSize, elementHeight);

      //Set font settings to draw it correctly.
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
      //var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2); // puts it in the middle
      var centerY = chart.chartArea.bottom - ((chart.chartArea.top + chart.chartArea.bottom) / 5); // puts it slightly above the bottom
      ctx.font = fontSizeToUse+"px " + fontStyle;
      ctx.fillStyle = color;

      //Draw text in center
      ctx.fillText(txt, centerX, centerY);
    }
  }
});

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

/*
	interface with parent process
*/

// Listen for async-reply message from main process
ipcRenderer.on('main-to-renderer', (event, arg) => {  
	
	var displayJSON = JSON.parse(arg);
	
	// set new data values in the chart objects
	mph_doughnut_chart.data.datasets[0].data[0] = displayJSON.MPH;
	mph_doughnut_chart.data.datasets[0].data[1] = mph_max - displayJSON.MPH;
	mph_doughnut_chart.options.elements.center.text = pad(displayJSON.MPH, 2).toString();
	
	rpm_doughnut_chart.data.datasets[0].data[0] = displayJSON.RPM;
	rpm_doughnut_chart.data.datasets[0].data[1] = rpm_max - displayJSON.RPM;
	rpm_doughnut_chart.options.elements.center.text = pad(displayJSON.RPM, 4).toString();
	
	fuel_bar_chart.data.datasets[0].data[0] = displayJSON.FUEL;
	vbat_bar_chart.data.datasets[0].data[0] = displayJSON.VBAT;
	batc_bar_chart.data.datasets[0].data[0] = displayJSON.BATC;
	ect_bar_chart.data.datasets[0].data[0] = displayJSON.ECT;
	act_bar_chart.data.datasets[0].data[0] = displayJSON.ACT;
	oilp_bar_chart.data.datasets[0].data[0] = displayJSON.OILP;
	
	egol_bar_chart.data.datasets[0].data[0] = displayJSON.EGOL;
	egor_bar_chart.data.datasets[0].data[0] = displayJSON.EGOR;
	
	// update chart objects
	doughnut_ids.forEach(function(element) {
		var c = doughnut_id_to_object[element];
		c.update();
	});
	
	bar_ids.forEach(function(element) {
		var c = bar_id_to_object[element];
		c.update();
	});
	
	// update the notification panel 
	
	if (displayJSON.EBRK) {
		npanel_ebreak.innerHTML = "Emergency Brake!";
	}
	else {
		npanel_ebreak.innerHTML = "";
	}
	
	if (displayJSON.RVRS) {
		npanel_reverse.innerHTML = "Reverse!";
	}
	else {
		npanel_reverse.innerHTML = "";
	}
	
	npanel_state.innerHTML = "State: " + displayJSON.state;
	
	npanel_odo.innerHTML = "Odometer: " + displayJSON.odometerValue.toString() + " miles"
	
	// update the blinkers
	
	if (displayJSON.LEFT) {
		left_blinker_corner.style.display = "block";
	}
	else {
		left_blinker_corner.style.display = "none";
	}
	
	if (displayJSON.RIGHT) {
		right_blinker_corner.style.display = "block";
	}
	else {
		right_blinker_corner.style.display = "none";
	}
	
	// Reply on async message from renderer process
    event.sender.send('renderer-to-main', 1);
});
