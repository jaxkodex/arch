


var app = {};

app.View = Backbone.View.extend({
	initialize: function (options) {
		options = options || {};
		if (options.template)
			this.template = options.template
	},
	render: function () {
		data = {};
		if (this.model) data = this.model.toJSON();
		if (this.template)
			this.$el.html(this.template(data));
		return this;
	},
});

app.ListView = app.View.extend({
	render: function () {
		var me = this, items = [];
		this.collection.each(function (item) {
			var itemView = new me.itemView({ model: item });
			items.push(itemView.render().el);
		});
		this.$el.empty().append(items);
		return this;
	}
});

app.LayoutView = Backbone.View.extend({
	render: function () {
		var me = this;
		this.$el.empty().html(this.template());
		_.each(this.regions, function (value, key) {
			me.$(value).empty().append(me[key].render().el);
		});
		return this;
	}
});