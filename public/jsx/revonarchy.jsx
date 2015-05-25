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
          <Input type='submit' value='Create or Add User' />
        </form>
      );
    }
  });

  var userDisplay = function(user) {
    if (user.name && user.name.length > 0) {
      return user.name;
    } else if (user.email && user.email.length > 0) {
      return user.email;
    } else {
      return 'Mystery Man';
    }
  };

  var AddedUser = React.createClass({
    onRemove: function() {
      this.props.onRemove(this.props.email);
    },

    render: function() {
      var Glyphicon = ReactBootstrap.Glyphicon;
      var Button = ReactBootstrap.Button;
      var ButtonGroup = ReactBootstrap.ButtonGroup;
      var ButtonToolbar = ReactBootstrap.ButtonToolbar;
      if (!this.props.finalized) {
        return (
          <ButtonToolbar>
            <ButtonGroup>
              <Button disabled={this.props.finalized}>{userDisplay(this.props)}</Button>
              <Button onClick={this.onRemove} disabled={this.props.finalized}><Glyphicon glyph='remove' /></Button>
            </ButtonGroup>
          </ButtonToolbar>
        );
      } else {
        return <li>{userDisplay(this.props)}</li>;
      }
    }
  });

  var AddedUsers = React.createClass({
    render: function() {
      var _this = this;
      var header = '';
      if (this.props.users.length > 0) {
        header = (
          <h3>Current Comrades</h3>
        );
      }
      var addedUsers = this.props.users.map(function (user) {
        return (
          <AddedUser key={user.email} name={user.name} email={user.email} onRemove={_this.props.onRemove}
            finalized={_this.props.finalized} />
        );
      });
      if (!this.props.finalized) {
        return (
          <div className='added-users' >
            {header}
            {addedUsers}
          </div>
        );
      } else {
        return (
          <ul className='added-users' >
            {addedUsers}
          </ul>
        );
      }
    }
  });

  var PreviousUser = React.createClass({
    onAdd: function() {
      this.props.onAdd(this.props.email);
    },

    render: function() {
      var Glyphicon = ReactBootstrap.Glyphicon;
      var Button = ReactBootstrap.Button;
      var ButtonGroup = ReactBootstrap.ButtonGroup;
      var ButtonToolbar = ReactBootstrap.ButtonToolbar;
      if (!this.props.finalized) {
        return (
          <ButtonToolbar>
            <ButtonGroup>
              <Button>{userDisplay(this.props)}</Button>
              <Button onClick={this.onAdd}><Glyphicon glyph='plus' /></Button>
            </ButtonGroup>
          </ButtonToolbar>
        );
      } else {
        return <li>{userDisplay(this.props)}</li>;
      }
    }
  });

  var PreviousUsers = React.createClass({
    render: function() {
      var _this = this;
      var previousUsers = this.props.users.map(function (user) {
        return (
          <PreviousUser key={user.email} name={user.name} email={user.email} onAdd={_this.props.onAdd} />
        );
      });
      return (
        <div className='removed-users' >
          {previousUsers}
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
      if (!this.props.disabled) {
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
      if (this.props.disabled) {
        bsStyle = 'default';
      } else {
        bsStyle = 'primary';
      }
      var revonarch = this.props.parentState.revonarch;
      var revonarchSection = '';
      if (revonarch) {
        revonarchSection = (
          <h2 className='hail-revonarch'>All hail the Revonarch <span className='revonarch-red'>{userDisplay(revonarch)}</span>!</h2>
        );
      }
      return (
        <div className='revonarch-section'>
          <Button bsStyle={bsStyle} bsSize='large' onClick={this.props.onRevonarch}
              disabled={this.props.disabled} block>
            {'Select the Revonarch'}
          </Button>
          {revonarchSection}
        </div>
      );
    }
  });

  var StaticLinks = React.createClass({
    render: function() {
      var Glyphicon = ReactBootstrap.Glyphicon;
      var encodedUsers = [];
      var allHref;
      var currentHref;
      var currentLink;
      var encodeUser = function(user) {
        var tmpUser = {
          name: user.name,
          email: user.email
        };
        return encodeURIComponent(JSON.stringify(tmpUser));
      };
      var i;
      for (i = 0; i < this.props.users.length; i++) {
        encodedUsers.push(encodeUser(this.props.users[i]));
      }
      currentHref = '/?user=' + encodedUsers.join('&user=');
      for (i = 0; i < this.props.previousUsers.length; i++) {
        encodedUsers.push(encodeUser(this.props.previousUsers[i]));
      }
      if (encodedUsers.length > 0) {
        allHref = '/?user=' + encodedUsers.join('&user=');
        if (this.props.users.length > 0) {
          currentLink = [(
            <span className='links-separator' >-</span>
          ), (
            <a href={currentHref}>
              <Glyphicon glyph='link' />
              <span>{'Selected Comrades Permalink'}</span>
            </a>
          )]
        } else {
          currentLink = '';
        }
        return (
          <div className='revonarch-section text-center'>
            <a href={allHref}>
              <Glyphicon glyph='link' />
              <span>{'All Comrades Permalink'}</span>
            </a>
            {currentLink}
          </div>
        );
      } else {
        return (
          <div />
        );
      }
    }
  })

  var getSavedUsers = function() {
    var locallyStoredUsers;
    try {
      locallyStoredUsers = JSON.parse(localStorage.users);
      if ($.isArray(locallyStoredUsers)) {
        return locallyStoredUsers;
      } else {
        return [];
      }
    } catch (e) {
      return [];
    }
  };

  var saveUsers = function(users) {
    localStorage.users = JSON.stringify(users);
  };

  var Application = React.createClass({
    getInitialState: function() {
      var previousUsers = getSavedUsers();
      return {
        createUser: {
          email: '',
          name: ''
        },
        users: [],
        previousUsers: previousUsers,
        finalized: false,
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
      var addUserToArray = function(user, array) {
        var i;
        var existingUser = false;
        for (i = 0; i < array.length; i++) {
          if (array[i].email === user.email) {
            existingUser = array.splice(i, 1, user);
            break;
          }
        }
        if (!existingUser) {
          array.push(user);
        }
        return array;
      };
      var removeUserFromArray = function(user, array) {
        var i;
        for (i = 0; i < array.length; i++) {
          if (array[i].email === user.email) {
            array.splice(i, 1);
            break;
          }
        }
        return array;
      };
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
          var savedUsers = getSavedUsers();
          if (data && data.user) {
            _this.setState({
              users: addUserToArray(data.user, _this.state.users),
              previousUsers: removeUserFromArray(data.user, _this.state.previousUsers)
            });
            saveUsers(addUserToArray(data.user, savedUsers));
          }
        },
        failure: function(errMsg) {
          //TODO Handle this error
        }
      });
      event.preventDefault();
    },

    addUser: function(email) {
      var i;
      var addedUsers = false;
      for (i = 0; i < this.state.previousUsers.length; i++) {
        if (this.state.previousUsers[i].email === email) {
          addedUsers = this.state.previousUsers.splice(i, 1);
          break;
        }
      }
      if (addedUsers) {
        this.setState({
          users: this.state.users.concat(addedUsers),
          previousUsers: this.state.previousUsers
        });
      }
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
          previousUsers: this.state.previousUsers.concat(removedUsers)
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
          users: this.state.users,
          group: this.state.group
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
      var createUserForm;
      var finalizeGroup;
      if (this.state.finalized) {
        createUserForm = '';
        finalizeGroup = '';
      } else {
        createUserForm = (
          <div>
            <CreateUser
                email={this.state.email}
                name={this.state.name}
                onUserInput={this.onUserInput}
                onSubmit={this.createUser}
                formState={this.state.createUser} />
            <PreviousUsers
                users={this.state.previousUsers}
                onAdd={this.addUser} />
          </div>
        );
        finalizeGroup = (
          <FinalizeGroup
              onFinalize={this.finalizeGroup}
              disabled={this.state.users.length < 2} />
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
            {finalizeGroup}
            <Revonarch
                onRevonarch={this.revonarch}
                parentState={this.state}
                disabled={!this.state.groupFetched} />
            <StaticLinks
                users={this.state.users}
                previousUsers={this.state.previousUsers} />
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
