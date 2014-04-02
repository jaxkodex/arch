


var app = app || {};

app.widgets = app.widgets || {}

app.widgets.PopupWindow = app.LayoutView.extend({
	title: 'Popup Window',
	className: 'popup_window',
	events: {
		'click .close': 'closeWindow'
	},
	initialize: function (options) {
		var me = this, opened = false;
		options = options || {};
		this.windowTitleView = new app.View({
			template: _.template('<%=title%>'),
			model: new Backbone.Model({title: options.title || me.title})
		});
		this.isOpened = function () {
			return opened;
		};
		this.openWindow = function () {
			if (!me.isOpened()) {
				this.$el.appendTo('body');
				this.render();
				app.widgets.PopupWindow.instances[me.cid] = me;
			}
			opened = true;
			return this;
		};
		this.closeWindow = function (evt) {
			evt.preventDefault();
			me.$el.remove();
			opened = false;
			delete app.widgets.PopupWindow.instances[me.cid];
		}
		if (options.body) {
			this.regions['body'] = '.body'
			this.body = options.body;
		}
	},
	template: _.template('<div class="title"></div><div class="body"><a class="close" href="#">Close</a></div>'),
	regions: {
		windowTitleView: '.title'
	}
});

app.widgets.PopupWindow.instances = {};