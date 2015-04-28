var Application = function() {

  var CreateUser = React.createClass({
    handleChange: function() {
      this.props.onUserInput(
        this.refs.userEmailTextInput.getValue(),
        this.refs.userNameInput.getValue()
      );
    },

    render: function() {
      var Input = ReactBootstrap.Input;
      return (
        <form onSubmit={this.props.onSubmit} >
          <h3>Add comrades who could be chosen as <span className='revonarch-red'>Revonarch</span></h3>
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
            value={this.props.name}
            onChange={this.handleChange}
            ref='userNameInput'
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
          name: ''
        },
        users: []
      };
    },

    onUserInput: function(email, name) {
      this.setState({
        createUser: {
          email: email,
          name: name
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
            name: this.state.createUser.name
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
      event.preventDefault();
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
            <CreateUser email={this.state.email} name={this.state.name} onUserInput={this.onUserInput} onSubmit={this.createUser} />
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
