/*
  eslint-disable react/prefer-stateless-function, react/jsx-boolean-value,
  no-undef, jsx-a11y/label-has-for
*/
class TimersDashboard extends React.Component {
  state = {
    timers: [],
  }

  componentDidMount() {
    this.loadTimersFromServer();
    setInterval(this.loadTimersFromServer, 10000);
  }

  loadTimersFromServer = () => {
    client.getTimers((serverTimers) => (
      this.setState({ timers: serverTimers })
    ));
  };

  newTimer = (attr = {}) => {
    const timer = {
      title: attr.title || 'Title',
      project: attr.project || 'Project',
      id: uuid.v4(),
      elapsed: 0,
    };
    return timer;
  };

  handleCreateFormSubmit = (timer) => {
    console.log('form data submitted', timer)
    this.createTimer(timer)
  };

  createTimer = (timer) => {
    const t = this.newTimer(timer);
    this.setState({
      timers: this.state.timers.concat(t)
    })
    console.log(t)

    client.createTimer(t);
  };

  handleUpdateFormSubmit = (timer) => {
    this.updateTimer(timer)
  };

  updateTimer = (attrs) => {
    this.setState({
      timers: this.state.timers.map((timer) => {
        if (timer.id === attrs.id) {
          return Object.assign({}, timer, {
            title: attrs.title,
            project: attrs.project,
          });
        }
        else {
          return timer;
        }
      }),
    });

    client.updateTimer(attrs);
  };

  handleTrashClick = (timerId) => {
    console.log('going to trash timer: ', timerId)
    this.deleteTimer(timerId);
  }

  deleteTimer = (timerId) => {
    this.setState({
      timers: this.state.timers.filter(t => t.id !== timerId),
    });

    client.deleteTimer(
      { id: timerId }
    );
  };

  handleStopClick = (timerId) => {
    console.log('stop timer ', timerId)
    this.stopTimer(timerId)
  };

  startTimer = (timerId) => {
    const now = Date.now()

    this.setState({
      timers: this.state.timers.map((timer) => {
        if (timerId === timer.id) {
          return Object.assign({}, timer, {
            runningSince: now,
          });
        }
        else {
          return timer
        };
      }),
    });

    client.startTimer(
      { id: timerId, start: now }
    );
  };

  handleStartClick = (timerId) => {
    console.log('start timer ', timerId)
    this.startTimer(timerId)
  };

  stopTimer = (timerId) => {
    const now = Date.now()
    this.setState({
      timers: this.state.timers.map((timer) => {
        if (timerId === timer.id) {
          return Object.assign({}, timer, {
            elapsed: timer.elapsed + (now - timer.runningSince),
            runningSince: null,
          });
        }
        else {
          return timer
        };
      }),
    });
    
    client.stopTimer(
      { id: timerId, stop: now }
    );
  };

  render() {
    console.log('TimersDashboard Ran')
    return (
      <div className='ui three column centered grid'>
        <div className='column'>
          <EditableTimerList 
            timers={this.state.timers}
            onFormSubmit={this.handleUpdateFormSubmit}
            onTrashClick={this.handleTrashClick}
            onStopClick={this.handleStopClick}
            onStartClick={this.handleStartClick}
          />
          <ToggleableTimerForm 
            onFormSubmit={this.handleCreateFormSubmit}
          />
        </div>
      </div>
    );
  }
}

class ToggleableTimerForm extends React.Component {
  state = {
    isOpen: false,
  }

  handleFormOpen = () => {
    this.setState({ isOpen: true });
  };

  handleFormClose = () => {
    this.setState({ isOpen: false });
  };

  handleFormSubmit = (timer) => {
    this.props.onFormSubmit(timer)
    this.setState({ isOpen: false })
  }

  render() {
    console.log('ToggleableTimerForm Ran')
    if (this.state.isOpen) {
      return (
        <TimerForm 
          onFormClose={this.handleFormClose}
          onFormSubmit={this.handleFormSubmit}
        />
      );
    } else {
      return (
        <div className='ui basic content center aligned segment'>
          <button 
            className='ui basic button icon'
            onClick={this.handleFormOpen} 
          >
            <i className='plus icon' />
          </button>
        </div>
      );
    }
  }
}

class EditableTimerList extends React.Component {
  render() {
    console.log('EditableTimerList Ran')
    const timers = this.props.timers.map((timer) => (
      <EditableTimer 
        id={timer.id}
        key={timer.id}
        title={timer.title}
        project={timer.project}
        elapsed={timer.elapsed}
        runningSince={timer.runningSince}
        onFormSubmit={this.props.onFormSubmit}
        onTrashClick={this.props.onTrashClick}
        onStopClick={this.props.onStopClick}
        onStartClick={this.props.onStartClick}
      />
    ));

    return (
      <div id='timers'>
        {timers}
      </div>
    );
  }
}

class EditableTimer extends React.Component {
  state = {
    editFormOpen: false,
  };

  handleFormClose = () => {
    this.setState({ editFormOpen: false })
  };

  handleEditClick = () => {
    this.setState({ editFormOpen: true })
  }

  handleFormSubmit = (timer) => {
    this.props.onFormSubmit(timer)
    this.setState({ editFormOpen: false })
  }

  render() {
    console.log('EditableTimer Ran')
    if (this.state.editFormOpen) {
      return (
        <TimerForm
          id={this.props.id}
          key={this.props.id}
          title={this.props.title}
          project={this.props.project}
          onFormSubmit={this.handleFormSubmit}
          onFormClose={this.handleFormClose}
        />
      );
    } else {
      return (
        <Timer
          id={this.props.id}
          key={this.props.id}
          title={this.props.title}
          project={this.props.project}
          elapsed={this.props.elapsed}
          runningSince={this.props.runningSince}
          onEditClick={this.handleEditClick}
          onTrashClick={this.props.onTrashClick}
          onStopClick={this.props.onStopClick}
          onStartClick={this.props.onStartClick}
        />
      );
    }
  }
}

class Timer extends React.Component {
  componentDidMount() {
    this.forceUpdateInterval = setInterval(() => this.forceUpdate(), 50);
  }

  componentWillUnmount() {
    clearInterval(this.forceUpdateInterval);
  }

  handleStartClick = () => {
    this.props.onStartClick(this.props.id)
  }

  handleStopClick = () => {
    this.props.onStopClick(this.props.id)
  }

  handleTrashClick = () => {
    this.props.onTrashClick(this.props.id)
  }

  render() {
    /* console.log('Timer Ran') */
    const elapsedString = helpers.renderElapsedString(
      this.props.elapsed, this.props.runningSince);
    return (
      <div className='ui centered card'>
        <div className='content'>
          <div className='header'>
            {this.props.title}
          </div>
          <div className='meta'>
            {this.props.project}
          </div>
          <div className='center aligned description'>
            <h2>
              {elapsedString}
            </h2>
          </div>
          <div className='extra content'>
            <span className='right floated edit icon' onClick={this.props.onEditClick}>
              <i className='edit icon' />
            </span>
            <span className='right floated trash icon' onClick={this.handleTrashClick}>
              <i className='trash icon' />
            </span>
          </div>
        </div>
        <TimerActionButton 
          timerIsRunning={!!this.props.runningSince}
          onStartClick={this.handleStartClick}
          onStopClick={this.handleStopClick}
        />
      </div>
    );
  }
}

class TimerActionButton extends React.Component {
  render() {
    /* console.log('TimerActionButton Ran') */
    if (this.props.timerIsRunning) {
      return (
        <div className='ui bottom attached red basic button' onClick={this.props.onStopClick}>
          Stop
        </div>
      );
    }
    else {
      return (
        <div className='ui bottom attached blue basic button' onClick={this.props.onStartClick}>
          Start
        </div>
      );
    }   
  }
}

class TimerForm extends React.Component {
  state = {
    title: this.props.title || '',
    project: this.props.project || '',
  };

  handleTitleChange = (e) => {
    console.log('handleTitleChange invoked')
    this.setState({ title: e.target.value })
  }

  handleProjectChange = (e) => {
    this.setState({ project: e.target.value })
  }

  handleSubmit = () => {
    this.props.onFormSubmit({
      id: this.props.id,
      title: this.state.title,
      project: this.state.project,
    });
  };

  render() {
    console.log('TimerForm Ran')
    const submitText = this.props.id ? 'Update' : 'Create';
    return (
      <div className='ui centered card'>
        <div className='content'>
          <div className='ui form'>
            <div className='field'>
              <label>Title</label>
              <input type='text' value={this.state.title} onChange={this.handleTitleChange}/>
            </div>
            <div className='field'>
              <label>Project</label>
              <input type='text' value={this.state.project} onChange={this.handleProjectChange} />
            </div>
            <div className='ui two bottom attached buttons'>
              <button className='ui basic blue button' onClick={this.handleSubmit}>
                {submitText}
              </button>
              <button className='ui basic red button' onClick={this.props.onFormClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <TimersDashboard />,
  document.getElementById('content')
);
