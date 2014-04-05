//window.location.hash.substr(1).split('&')
//window.location.hash.substr(1).split('&')[0].split('=')[1]

var app = app || {};

var LiveUser = Backbone.Model.extend({
	url: 'https://apis.live.net/v5.0/me'
});

var OneDriveDocument = Backbone.Model.extend({
	url: function () {
		return 'https://apis.live.net/v5.0/'+this.get('id');
	},
	getContentsUrl: function () {
		return 'https://apis.live.net/v5.0/'+this.get('id')+'/files';
	}
});

var OneDriveDocumentCollection = Backbone.Collection.extend({
	initialize: function (options) {
		this.url = options.url;
	},
	model: OneDriveDocument,
	parse: function (response) {
		return response.data;
	}
});

var FolderItemView = app.View.extend({
	events: {
		'click .show-contents': 'navigate'
	},
	template: _.template('<a class="show-contents" href="#"><%=name%></a>'),
	navigate: function (evt) {
		evt.preventDefault();
		if (this.model.get('type') == 'folder')
			app.instance.showFolder(this.model);
		else
			window.open(this.model.get('source'));
	}
});

var FolderContentsView = app.ListView.extend({
	initialize: function () {
		var me = this;
		this.on('update', function (token) {
			console.log('updating values for folder '+ me.collection.url);
			me.collection.reset();
			me.collection.fetch({
				data: {
					access_token: token
				}
			});
		});
		this.collection.on('add', this.render, this);
	},
	template: _.template(''),
	itemView: FolderItemView
});

var ExplorerLayoutView = app.LayoutView.extend({
	template: _.template('<div class="body"></div>'),
	regions: {
		'.body': 'view'
	}
});

app.instance = {
	init: function () {
		var me = this;
		this.currentFolder = new OneDriveDocument({
			id: 'folder.'+u.get('id')
		});
		this.currentFolderContents = new OneDriveDocumentCollection ({
			url: this.currentFolder.getContentsUrl()
		});
		this.explorer = new ExplorerLayoutView({
			view: new FolderContentsView({
				collection: me.currentFolderContents
			})
		});
		$('#main').empty().append(this.explorer.render().el);
		this.explorer.view.trigger('update', this.access_token);
	},
	showFolder: function (folder) {
		this.currentFolderContents.url = folder.getContentsUrl();
		this.currentFolder = folder;
		this.explorer.view.trigger('update', this.access_token);
	},
	goBack: function () {
		if (this.currentFolder.get('parent_id')) {
			this.currentFolder = new OneDriveDocument({
				id: this.currentFolder.get('parent_id')
			});
			this.currentFolderContents.url = this.currentFolder.getContentsUrl();
			this.explorer.view.trigger('update', this.access_token);
			this.currentFolder.fetch({
				data: {
					access_token: this.access_token
				}
			});
		}
	}
};

if (window.location.hash.substr(1).split('&')[0].split('=')[1]) {
	var access_token = window.location.hash.substr(1).split('&')[0].split('=')[1];
	var u = new LiveUser();
	app.instance.access_token = access_token;
	u.fetch({ data: {access_token: access_token}, success: function () {
		app.instance.init();
	}});
}