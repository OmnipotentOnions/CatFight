import React from 'react';
import {render} from 'react-dom';
import {User} from './User.jsx';
import {Opponent} from './Opponent.jsx';
import {Question} from './Question.jsx';
import {Display} from './Display.jsx';
import Axios from '../../../node_modules/axios/lib/axios.js'; 
import {Link} from 'react-router';
import {browserHistory} from 'react-router';
import { connect } from 'react-redux';
import {setUser} from './actions/index.jsx';
import {Navbar} from './Navbar.jsx';
import {Topbar} from './Topbar.jsx';
import {ReactCSSTransitionGroup} from 'react-addons-css-transition-group';


class Arena extends React.Component {
  constructor() {
    super();

    this.state = {
      userHP: 100,
      opponentHP: 100,
      question: '',
      evilCatAvatar: '',
      answer: '',
      message: '',
    };
  }

  componentWillMount() {
    this.generateQuestion();
    this.getEvilAvatar();
  }

  componentDidMount() {
    if (this.state.opponent === 0) {
      this.state.userlvl++;
    }
  }

  attack() {
    var user = document.getElementById('userContainer');
    var opponent = document.getElementById('opponentContainer');

    this.setState({
      opponentHP: this.state.opponentHP - 20,
      message: this.state.message = 'Great job! You\'ve damaged the enemy.',
    });
    user.style.animation = 'attack2 1000ms infinite';
    opponent.style.animation = 'shake 1000ms infinite';
    setTimeout(() => { user.style.animation = 'attack2 1000ms paused'; }, 2000);
    setTimeout(() => { opponent.style.animation = 'shake 1000ms paused'; }, 2000);
    // attack and shake animations not getting reset
  }

  miss() {
    var opponent = document.getElementById('opponentContainer');
    var user = document.getElementById('userContainer');
    
    this.setState({
      userHP: this.state.userHP - 20,
      message: this.state.message = 'Oh no! You\'ve been hit!',
    });
    opponent.style.animation = 'attack 1000ms infinite';
    user.style.animation = 'shake 1000ms infinite';
    setTimeout(() => { opponent.style.animation = 'attack 1000ms paused'; }, 2000);
    setTimeout(() => { user.style.animation = 'shake 1000ms paused'; }, 2000);
    // attack and shake animations not getting reset
  }

  checkHealth() {
    if (this.state.userHP <= 0) {
      this.setState({
        message: 'Sorry...try again',
      });
    } else if (this.state.opponentHP <= 0) {
      this.setState({
        message: 'You win!',
        opponentHP: 100,
        userHP: 100,
      });
      // POOR IMPLEMENTATION, NEED TO MAKE NEW LVL UP ACTION
      this.props.dispatch(setUser({
        username: this.props.username,
        userlvl: this.props.userlvl + 1,
        userAvatar: this.props.userAvatar,
      }));
    }
  }

  generateQuestion() {
    var userlvl = this.props.userlvl;
    var operands = ['+', '-', '*', '/'];
    var firstDigit = Math.floor(Math.random() * Math.pow(10, userlvl));
    var secondDigit = Math.floor(Math.random() * Math.pow(10, userlvl));
    var operandIndex = Math.floor(Math.random() * 2);

    var answer = eval(firstDigit + operands[operandIndex] + secondDigit);
    this.setState({
      answer: answer
    });
    this.setState({
      question: firstDigit + ' ' + operands[operandIndex] + ' ' + secondDigit + ' = '
    });
  }


  checkAnswer(answer) {
    if (answer === '' + this.state.answer) {
      this.attack();
      var user = document.getElementById('userContainer');
      // user.style.animation = 'attack2 1000ms paused';

      this.checkHealth();
      this.generateQuestion();
    } else {
      this.miss();
      var opponent = document.getElementById('opponentContainer');
      // opponent.style.animation = 'attack 1000ms paused';

      this.checkHealth();
      this.generateQuestion();
    }
  }

  getEvilAvatar() {
    var context = this;
    Axios.get('https://www.googleapis.com/customsearch/v1?key=' + window.GMAP_KEY + '&cx=009407302250325958776:7xs2zpwdaho&q=evil%20cat%20gif&searchType=image')
    .then(function (response) {
      var randomIndex = Math.floor(Math.random() * response.data.items.length);
      var evilCat = response.data.items[randomIndex].link;
      context.setState({
        evilCatAvatar: evilCat 
      });
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  signOut() {
    var context = this;
    Axios.put('http://localhost:3000/user/' + context.props.username, {
      level: this.props.userlvl,
    })
    .then(function(res) {
      console.log(res);
      browserHistory.push('/');
    });
  }

  render () {
    return (
    <div>

    <Topbar signOut={() => this.signOut()}/>

    <div className="container-fluid">
      <div className="row">

        <Navbar />

        <div className="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
          <h1 className="page-header">Arena</h1>

          <div className="row placeholders">

            <div className="col-xs-6 col-sm-3 placeholder" id="userContainer">
              <User userImage={this.props.userAvatar} user={this.state.user}/>
              <h4>You Lvl.{this.props.userlvl}</h4>
              <span className="text-muted">Health</span>
              <progress value={this.state.userHP} max="100"></progress>
            </div>

            <div className="col-xs-6 col-sm-3 placeholder" id="opponentContainer">
              <Opponent opponentImage={this.state.evilCatAvatar} opponent={this.state.opponent}/>
              <h4>Opponent</h4>
              <span className="text-muted">Health</span>
              <progress value={this.state.opponentHP} max="100"></progress>
            </div>
            </div>
            <div className="jumbotron">
              <Display display={this.state.message}/>
              <Question question={this.state.question}/>
              <form>
                <input id='answerForm' type='text' placeholder='Enter Answer'></input>
              </form>
              <p>
                <a onClick={() => this.checkAnswer(document.getElementById('answerForm').value)}className="btn btn-lg btn-success" href="#"role="button">Answer</a>
              </p>
          </div>

        </div>
      </div>
    </div>
    </div>
    );
  }
}

const mapStateToProps = (state) => ({
  username : state.username,
  userlvl: state.userlvl,
  userAvatar: state.userAvatar,
});

Arena = connect(mapStateToProps)(Arena);

export {Arena};