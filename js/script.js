var data_URL = "/data/feed.json";


jQuery(function(){

	getDataAndRender();

});


function getDataAndRender() {

//get the URL of the REST API call to JIRA
	$.get( data_URL, function( data ) {
	  console.log( "Data Loaded: ++" );
	  var stories = [];

	  for (var i = 0; i < data.issues.length; i++) {
	  	var issue = data.issues[i]
	  	var _fields = issue.fields;

	  	//check if issue is a story
	  	if (_fields.issuetype.name === "Story" || _fields.issuetype.name === "Bug" || _fields.issuetype.name === "Task") {
	  		var story = {};
	  		story.id = issue.id;
	  		story.key = issue.key;
	  		story.type = _fields.issuetype.name;
	  		story.summary = _fields.summary;
	  		story.description = _fields.description ? _fields.description.split(/\n/)[0] : ''; //split out the carriage return
	  		story.assigneename = _fields.assignee ? _fields.assignee.displayName : 'None';
	  		story.estimate = _fields.customfield_10004;
	  		story.status = _fields.status.name;

	  		story.statuses = getStatusItems(_fields.status.name);

	  		stories.push(story);
	  	}

	  };

		var storyCont = {}; //TODO refactor
		storyCont.stories = stories;

		//var finalStories = massageInprogressStories(storyCont);

		console.log(storyCont);
		renderTemplate(storyCont);
	});

	setTimeout(getDataAndRender, 60000); //repeat this every minute

}

function massageInprogressStories(storyCont) {
	for (var i = 0; i < storyCont.stories.length; i++) {
		var _todo = storyCont.stories[i].subtasks.todo ? storyCont.stories[i].subtasks.todo.length : 0;
		var _devdone = storyCont.stories[i].subtasks.developerdone ? storyCont.stories[i].subtasks.developerdone.length : 0;
		var _inprogress = storyCont.stories[i].subtasks.inprogress ? storyCont.stories[i].subtasks.inprogress.length : 0;
		var _review = storyCont.stories[i].subtasks.peerreview ? storyCont.stories[i].subtasks.peerreview.length : 0;
		if ( _todo < (_devdone + _inprogress + _review) && storyCont.stories[i].status == "To Do") {
			storyCont.stories[i].status = "In Progress";
		}
	};

	return storyCont;
}

function renderTemplate(stories) {
	var template = $('#row-template').html();

	var rendered = Mustache.render(template, stories);
	$('#target').html(rendered);
}

function getSubtaskAssignee(key, data) {
	for (var i = 0; i < data.issues.length; i++) {
	  	var issue = data.issues[i]
	  	var _fields = issue.fields;
	  	if (key === issue.key){
	  		//this is the subtask. get the assignee initials
	  		var name = _fields.assignee ? _fields.assignee.displayName : "";
	  		var _names = name.split(" ");
	  		if (_names.length > 1)
	  			return _names[0].substring(0, 1)+_names[1].substring(0,1)
	  		return "";
	  	}
	  }
	// no results
	return "XX";
}

function getStatusItems(_status) {
	var _inprogress = "In Progress";
	var _stakeholderreview = "Stakeholder Review";
	var _peerreview = "Peer Review";
	var _poreview = "PO Review";
	var _signoff = "Ready";
	var _released = "Released";

	var statuses = {};
	if (_status == _released) {
		statuses.released = "st-here";
		statuses.ready = "st-done";
		statuses.poreview = "st-done";
		statuses.peerreview = "st-done";
		statuses.stakeholderreview = "st-done"; 
		statuses.inprogress = "st-done";
	} else if (_status == _signoff) {
		statuses.ready = "st-here";
		statuses.poreview = "st-done";
		statuses.peerreview = "st-done"; 
		statuses.stakeholderreview = "st-done"; 
		statuses.inprogress = "st-done";
	} else if (_status == _poreview) {
		statuses.poreview = "st-here";
		statuses.peerreview = "st-done"; 
		statuses.stakeholderreview = "st-done"; 
		statuses.inprogress = "st-done";
	} else if (_status == _peerreview) {
		statuses.peerreview = "st-here";
		statuses.stakeholderreview = "st-done"; 
		statuses.inprogress = "st-done";
	} else if (_status == _stakeholderreview) {
		statuses.stakeholderreview = "st-here";
		statuses.inprogress = "st-done";
	} else if (_status == _inprogress) {
		statuses.inprogress = "st-here";
	}

	return statuses;
}


/**
JSON Data Structure
Story id: DD-53
Story summary: Login
Story description: As a user, I want to login so that I can totally see things clearly
Asignee: Jim Nguyen
Estimate: 5
Status: Stakeholder Review

Subtasks[] : {}

{
	story : DD-53

}

*/
