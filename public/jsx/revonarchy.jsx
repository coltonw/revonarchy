var Application = function() {

  var CreateUser = React.createClass({
    render: function() {
      var Input = ReactBootstrap.Input;
      return (
        <form>
          <Input
            type='text'
            placeholder='Enter email'
            label='Email Address'
            value={this.props.userEmail}
            ref='userEmailTextInput'
          />
          <Input
            type='text'
            placeholder='Enter Nickname'
            label='Nickname'
            value={this.props.userNickname}
            ref='userNicknameInput'
          />
          <Input type='submit' value='Create User' />
        </form>
      );
    }
});


  var Application = React.createClass({
    getInitialState: function() {
      return {
        content: []
      };
    },

    render: function() {
      var PageHeader = ReactBootstrap.PageHeader;
      return (
        <div className='container'>
          <PageHeader>Revonarchy <small>Who will rule this day?</small></PageHeader>
          <CreateUser userEmail={''} userNickname={''} />
        </div>
      );
    }
  });

  return Application;
}();

$(document).ready(function() {
  React.render(<Application />, document.body);
});
