var Application = function() {

  var CreateUser = React.createClass({
    handleChange: function() {
      this.props.onUserInput(
        this.refs.userEmailTextInput.getValue(),
        this.refs.userNicknameInput.getValue()
      );
    },

    render: function() {
      var Input = ReactBootstrap.Input;
      return (
        <form onSubmit={this.props.onSubmit} >
          <Input
            type='text'
            placeholder='Enter email'
            label='Email Address'
            value={this.props.email}
            onChange={this.handleChange}
            ref='userEmailTextInput'
          />
          <Input
            type='text'
            placeholder='Enter Nickname'
            label='Nickname'
            value={this.props.nickname}
            onChange={this.handleChange}
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
        createUser: {
          email: '',
          nickname: ''
        },
        users: []
      };
    },

    onUserInput: function(email, nickname) {
      this.setState({
        createUser: {
          email: email,
          nickname: nickname
        }
      });
    },

    createUser: function(event) {
      var self = this;
      $.ajax('/user', {
        method: 'post',
        data: JSON.stringify({
          user: {
            email: this.state.createUser.email,
            name: this.state.createUser.nickname
          }
        }),
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        success: function(data){
          if(data && data.user) {
            self.setState(self.state.users.concat(data.user));
          }
        },
        failure: function(errMsg) {
          //TODO Handle this error
        }
      });
    },

    render: function() {
      var Navbar = ReactBootstrap.Navbar;
      var PageHeader = ReactBootstrap.PageHeader;
      return (
        <div>
          <Navbar staticTop={true}>
            <h1>REVONARCHY <small>Who will rule this day?</small></h1>
          </Navbar>
          <div className='container'>
            <CreateUser email={this.state.email} nickname={this.state.nickname} onUserInput={this.onUserInput} onSubmit={this.createUser} />
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
