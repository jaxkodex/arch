


var app = {};

app.View = Backbone.View.extend({
	initialize: function (options) {
		var options = options || {};
		if (options.template)
			this.template = options.template
	},
	render: function () {
		var data = {};
		if (this.model) data = this.model.toJSON();
		if (this.template)
			this.$el.html(this.template(data));
		if (this.onRender) {
			this.onRender();
		}
		return this;
	},
});

app.ListView = app.View.extend({
	render: function () {
		var me = this, items = [], data = {};
		if (this.model) data = this.model.toJSON();
		this.collection.each(function (item) {
			var itemView = new me.itemView({ model: item });
			items.push(itemView.render().el);
		});
		this.$el.empty().html(this.template(data)).append(items);
		if (this.onRender) {
			this.onRender();
		}
		return this;
	}
});

app.LayoutView = Backbone.View.extend({
	initialize: function (options) {
		var me = this;
		_.each(this.regions, function (value, key) {
			if (options[value]) {
				me[value] = options[value]
			}
		});
	},
	render: function () {
		var me = this;
		this.$el.empty().html(this.template());
		_.each(this.regions, function (value, key) {
			me.$(key).empty().append(me[value].render().el);
		});
		if (this.onRender) {
			this.onRender();
		}
		return this;
	}
});