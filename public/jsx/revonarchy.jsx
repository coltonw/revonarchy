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
            ref='userEmailTextInput'
          />
          <Input
            type='text'
            placeholder='Enter Nickname'
            label='Nickname'
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
      var Navbar = ReactBootstrap.Navbar;
      var PageHeader = ReactBootstrap.PageHeader;
      return (
        <div>
          <Navbar staticTop='true'>
            <h1>REVONARCHY <small>Who will rule this day?</small></h1>
          </Navbar>
          <div className='container'>
            <CreateUser userEmail={''} userNickname={''} />
          </div>
        </div>
      );
    }
  });

  return Application;
}();

$(document).ready(function() {
  React.render(<Application />, document.body);
});
