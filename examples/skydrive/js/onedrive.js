

var LiveUser = Backbone.Model.extend({
	initialize: function (options) {
		var access_token = options.access_token;
		this.getAccessToken = function () {
			return access_token;
		}
	},
	url: function () {
		return 'https://apis.live.net/v5.0/me?'+this.getAccessToken();
	}
});

var OneDriveDocument = Backbone.Model.extend({
	initialize: function (options) {
		var access_token = options.access_token;
		this.getAccessToken = function () {
			return access_token;
		};
	},
	url: function () {
		return 'https://apis.live.net/v5.0/'+this.get('id')+'?'+this.getAccessToken();
	},
	getContents: function () {
		this.contents = new OneDriveDocumentCollection({
			url: 'https://apis.live.net/v5.0/'+this.get('id')+'/files?'+this.getAccessToken()
		});
		this.contents.fetch();
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