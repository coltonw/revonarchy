var Application = (function() {

  var CreateUser = React.createClass({
    handleChange: function() {
      this.props.onUserInput(
        this.refs.userEmailTextInput.getValue(),
        this.refs.userNameInput.getValue()
      );
    },

    emailValidationState: function() {
      var email = this.props.getFormState().email;
      var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
      if (re.test(email)) {
        return 'success';
      } else {
        return 'error';
      }
    },

    render: function() {
      var Input = ReactBootstrap.Input;
      return (
        <form onSubmit={this.props.onSubmit} >
          <h3>Add comrades who could be chosen as <span className='revonarch-red'>Revonarch</span></h3>
          <Input
            type='email'
            placeholder='Enter email'
            label='Email Address'
            value={this.props.email}
            bsStyle={this.emailValidationState()}
            hasFeedback
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

  var AddedUser = React.createClass({
    onRemove: function() {
      this.props.onRemove(this.props.email);
    },

    render: function() {
      var Glyphicon = ReactBootstrap.Glyphicon;
      var Button = ReactBootstrap.Button;
      var ButtonGroup = ReactBootstrap.ButtonGroup;
      var ButtonToolbar = ReactBootstrap.ButtonToolbar;
      return (
        <ButtonToolbar>
          <ButtonGroup>
            <Button>{this.props.name}</Button><Button onClick={this.onRemove}><Glyphicon glyph='remove' /></Button>
          </ButtonGroup>
        </ButtonToolbar>
      );
    }
  });

  var AddedUsers = React.createClass({
    render: function() {
      var Input = ReactBootstrap.Input;
      var _this = this;
      var addedUsers = this.props.users.map(function (user) {
        return (
          <AddedUser name={user.name} email={user.email} onRemove={_this.props.onRemove} />
        );
      });
      return (
          <div className='added-users' >
            {addedUsers}
          </div>
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
        users: [],
        previousUsers: []
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
      var _this = this;
      $.ajax('/user', {
        method: 'post',
        data: JSON.stringify({
          user: {
            email: this.state.createUser.email,
            name: this.state.createUser.name
          }
        }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(data) {
          if (data && data.user) {
            _this.setState({
              users: _this.state.users.concat(data.user)
            });
          }
        },
        failure: function(errMsg) {
          //TODO Handle this error
        }
      });
      event.preventDefault();
    },

    removeUser: function(email) {
      var i;
      var removedUsers = false;
      for (i = 0; i < this.state.users.length; i++) {
        if (this.state.users[i].email === email) {
          removedUsers = this.state.users.splice(i, 1);
          break;
        }
      }
      if (removedUsers) {
        this.setState({
          users: this.state.users,
          previousUsers: removedUsers.concat(this.state.previousUsers)
        });
      }
    },

    getFormState: function() {
      return this.state.createUser;
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
            <CreateUser email={this.state.email} name={this.state.name} onUserInput={this.onUserInput}
                onSubmit={this.createUser} getFormState={this.getFormState} />
            <AddedUsers users={this.state.users} onRemove={this.removeUser} />
          </div>
        </div>
      );
    }
  });

  return Application;
})();

$(document).ready(function() {
  React.render(<Application />, document.body);
});
