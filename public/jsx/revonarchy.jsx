var Application = React.createClass({
  getInitialState: function() {
    return {
      content: []
    };
  },

  render: function() {
    var PageHeader = ReactBootstrap.PageHeader;
    return (
      <div className="container">
        <PageHeader>Revonarchy <small>Who will rule this day?</small></PageHeader>
      </div>
    );
  }
});

$(document).ready(function() {
  React.render(<Application />, document.body);
});
