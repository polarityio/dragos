'use strict';

polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  productData: {},
  expandableTitleStates: {},
  showReports: {},
  actions: {
    changeTab: function (index, tabName) {
      this.set(`details.${index}.__activeTab`, tabName);
      console.log(this.get(`details.${index}.__activeTab`));
    },
    toggleExpandableTitle: function (index) {
      const modifiedExpandableTitleStates = Object.assign(
        {},
        this.get('expandableTitleStates'),
        {
          [index]: !this.get('expandableTitleStates')[index]
        }
      );

      this.set(`expandableTitleStates`, modifiedExpandableTitleStates);
    },
    showReports: function (index, tabName) {
      this.set('activeTab', tabName);
      this.toggleProperty('details.' + index + '.__showReports');
    },
    retryLookup: function () {
      this.set('running', true);
      this.set('errorMessage', '');
      const payload = {
        action: 'retryLookup',
        entity: this.get('block.entity')
      };
      this.sendIntegrationMessage(payload)
        .then((result) => {
          if (result.data.summary) this.set('summary', result.summary);
          this.set('block.data', result.data);
        })
        .catch((err) => {
          this.set('details.errorMessage', JSON.stringify(err, null, 4));
        })
        .finally(() => {
          this.set('running', false);
        });
    }
  }
});
[
  {
    productData: [{}]
  }
];
