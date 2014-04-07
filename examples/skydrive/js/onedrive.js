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
	className: 'contenido-directorio',
	events: {
		'click .show-contents': 'navigate'
	},
	template: _.template('<% if (typeof type != "undefined" && type == "photo") { %><img src="<%=source%>" /> <% } %><span class="folder-icon glyphicon <% if (typeof type != "undefined" && type == "folder") { %>glyphicon-folder-close <% } else { %>glyphicon-file<% } %>"></span> <a class="show-contents" href="#"><span><%=name%><span></a>'),
	navigate: function (evt) {
		evt.preventDefault();
		if (this.model.get('type') == 'folder')
			app.instance.showFolder(this.model);
		else
			window.open(this.model.get('source'));
	}
});

var FolderContentsView = app.ListView.extend({
	className: 'contenidos-directorio',
	events: {
		'click .go-back': 'goBack'
	},
	initialize: function () {
		var me = this;
		this.on('update', function (token) {
			me.$el.fadeOut({
				complete: function () {
					me.$el.empty().css({
						display: 'block'
					}).html('Cargando...');
					me.collection.reset();
					me.collection.fetch({
						data: {
							access_token: token
						}
					}).done(function () {
						me.$el.css({
							display: 'none'
						});
						me.render();
					});
				}
			});
		});
	},
	template: _.template('<div class="navigation-folder"><a class="go-back" href="#"><span class="glyphicon glyphicon-chevron-left"></span> Regresar</a></div>'),
	itemView: FolderItemView,
	onRender: function () {
		this.$el.fadeIn();
	},
	goBack: function (evt) {
		evt.preventDefault();
		app.instance.goBack();
	}
});

var TopExplorerView = app.View.extend({
	initialize: function () {
		var me = this;
		this.on('update', function () {
			me.render();
		});
	},
	template: _.template('<ol class="breadcrumb"><% for (var x in path) { %><li><%=path[x].name%></li><% } %></ol>'),
});

var ExplorerLayoutView = app.LayoutView.extend({
	template: _.template('<div class="top"></div><div class="body clearfix"></div>'),
	regions: {
		'.top': 'top',
		'.body': 'view'
	}
});

app.instance = {
	init: function () {
		var me = this;
		var PathModel = Backbone.Model.extend({
			defaults: {
				path: [{ name: 'OneDrive'}]
			}
		});
		this.path = new PathModel();
		this.currentFolder = new OneDriveDocument({
			id: 'folder.'+u.get('id')
		});
		this.currentFolderContents = new OneDriveDocumentCollection ({
			url: this.currentFolder.getContentsUrl()
		});
		this.explorer = new ExplorerLayoutView({
			top: new TopExplorerView({
				model: this.path
			}),
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
		this.path.get('path').push(folder.toJSON());
		this.explorer.view.trigger('update', this.access_token);
		this.explorer.top.trigger('update', this.access_token);
	},
	goBack: function () {
		if (this.currentFolder.get('parent_id')) {
			this.currentFolder = new OneDriveDocument({
				id: this.currentFolder.get('parent_id')
			});
			this.currentFolderContents.url = this.currentFolder.getContentsUrl();
			this.explorer.view.trigger('update', this.access_token);
			this.path.get('path').pop();
			this.explorer.top.trigger('update', this.access_token);
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