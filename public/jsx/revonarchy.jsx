var Application = (function() {

  var CreateUser = React.createClass({
    handleChange: function() {
      this.props.onUserInput(
        this.refs.userEmailTextInput.getValue(),
        this.refs.userNameInput.getValue()
      );
    },

    emailValidationState: function() {
      var email = this.props.formState.email;
      var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
      if (re.test(email)) {
        return 'success';
      } else {
        return 'error';
      }
    },

    namePattern: '.{1,200}',

    nameValidationState: function() {
      var name = this.props.formState.name;
      var re = new RegExp(this.namePattern);
      if (re.test(name)) {
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
            required
            maxLength='200'
            bsStyle={this.nameValidationState()}
            hasFeedback
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
            <Button disabled={this.props.finalized}>{this.props.name}</Button>
            <Button onClick={this.onRemove} disabled={this.props.finalized}><Glyphicon glyph='remove' /></Button>
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
          <AddedUser key={user.email} name={user.name} email={user.email} onRemove={_this.props.onRemove}
            finalized={_this.props.finalized} />
        );
      });
      return (
          <div className='added-users' >
            {addedUsers}
          </div>
      );
    }
  });

  var FinalizeGroup = React.createClass({
    render: function() {
      var Button = ReactBootstrap.Button;
      var ButtonGroup = ReactBootstrap.ButtonGroup;
      var ButtonToolbar = ReactBootstrap.ButtonToolbar;
      var bsStyle;
      if(this.props.ready) {
        bsStyle = 'primary';
      } else {
        bsStyle = 'default';
      }
      return (
        <Button bsStyle={bsStyle} bsSize='large' onClick={this.props.onFinalize}
            disabled={this.props.disabled} block>
          Finalize Comrades
        </Button>
      );
    }
  });

  var Revonarch = React.createClass({
    render: function() {
      var Button = ReactBootstrap.Button;
      var ButtonGroup = ReactBootstrap.ButtonGroup;
      var ButtonToolbar = ReactBootstrap.ButtonToolbar;
      var bsStyle;
      if(this.props.disabled) {
        bsStyle = 'default';
      } else {
        bsStyle = 'primary';
      }
      var revonarch = this.props.parentState.revonarch;
      var revonarchSection = '';
      if (revonarch) {
        if (revonarch.name) {
          revonarchSection = (
            <h1>All hail the Revonarch {revonarch.name}!</h1>
          );
        } else if (revonarch.email) {
          revonarchSection = (
            <h1>All hail the Revonarch {revonarch.email}!</h1>
          );
        }
      }
      return (
        <div className={'revonarch-section'}>
          <Button bsStyle={bsStyle} bsSize='large' onClick={this.props.onRevonarch}
              disabled={this.props.disabled} block>
            {'Select the Revonarch'}
          </Button>
          {revonarchSection}
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
        finalized: false,
        previousUsers: [],
        group: null,
        groupFetched: false,
        revonarch: null
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

    finalizeGroup: function() {
      var _this = this;
      this.setState({
        finalized: true
      });

      $.ajax('/group', {
        method: 'post',
        data: JSON.stringify({
          users: this.state.users
        }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(data) {
          if (data && typeof data.group !== 'undefined') {
            _this.setState({
              group: data.group,
              groupFetched: true
            });
          }
        },
        failure: function(errMsg) {
          //TODO Handle this error better
          _this.setState({
            finalized: false
          });
        }
      });
    },

    revonarch: function() {
      var _this = this;

      $.ajax('/revonarch', {
        method: 'post',
        data: JSON.stringify({
          users: this.state.users
        }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(data) {
          if (data && data.revonarch) {
            _this.setState({
              revonarch: data.revonarch
            });
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
      var createUser;
      if(this.state.finalized) {
        createUserForm = '';
      } else {
        createUserForm = (
          <CreateUser
              email={this.state.email}
              name={this.state.name}
              onUserInput={this.onUserInput}
              onSubmit={this.createUser}
              formState={this.state.createUser} />
        );
      }
      return (
        <div>
          <Navbar staticTop={true}>
            <h1>REVONARCHY <small>Who will rule this day?</small></h1>
          </Navbar>
          <div className='container'>
            {createUserForm}
            <AddedUsers
                users={this.state.users}
                onRemove={this.removeUser}
                finalized={this.state.finalized} />
            <FinalizeGroup
                onFinalize={this.finalizeGroup}
                disabled={this.state.finalized || this.state.users.length < 2}
                ready={this.state.users.length >= 2} />
            <Revonarch
                onRevonarch={this.revonarch}
                parentState={this.state}
                disabled={!this.state.groupFetched} />
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
