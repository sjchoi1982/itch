
import React, {PropTypes, Component} from 'react'
import {findDOMNode} from 'react-dom'
import {DragSource, DropTarget} from 'react-dnd'
import classNames from 'classnames'

import draggableTypes from '../constants/draggable-types'
import colors from '../constants/colors'
import getDominantColor from './get-dominant-color'

export class HubSidebarItem extends Component {
  constructor () {
    super()
    this.state = {}
    this.onClick = ::this.onClick
  }

  onClick (e) {
    if (e.nativeEvent.which === 2) {
      // middle click
      const {onClose} = this.props
      onClose && onClose()
    } else {
      // left (normal) click
      const {onClick} = this.props
      onClick && onClick()
    }
  }

  render () {
    const {t, count, sublabel, progress, id, path, label, active, halloween} = this.props
    const {isDragging, connectDragSource, connectDropTarget, onClose, onContextMenu} = this.props

    const classes = classNames('hub-sidebar-item', {active, ['hint--bottom']: sublabel})
    const style = {}
    const {dominantColor} = this.state

    if (active) {
      if (halloween) {
        style.borderColor = colors.spooky
      } else if (dominantColor) {
        style.borderColor = dominantColor
      }
    }

    const progressColor = dominantColor || 'white'

    return connectDragSource(connectDropTarget(<section key={id} style={style} className={classes} data-hint={t.format(sublabel)} onClick={this.onClick} onContextMenu={onContextMenu} onClose={onClose} data-path={path} data-id={id} data-dragging={isDragging}>
      <div className='row'>
        <span className='label'>{t.format(label)}</span>
        {count > 0
          ? <span className='bubble'>{count}</span>
          : ''
        }
        <div className='filler'/>
        {progress > 0
        ? <div className='progress-outer'>
          <div className='progress-inner' style={{width: `${Math.max(0, Math.min(1, progress)) * 100}%`, backgroundColor: progressColor}}/>
        </div>
        : ''}
        {onClose
          ? <span className='close-icon icon icon-cross' onClick={(e) => {
            onClose()
            e.stopPropagation()
          }}/>
          : ''
        }
      </div>
    </section>))
  }

  componentWillReceiveProps () {
    this.updateColor()
  }

  componentDidMount () {
    this.updateColor()
  }

  updateColor () {
    let game = this.props.gameOverride
    if (!game) {
      const {games} = this.props.data || {}
      if (games) {
        game = games[Object.keys(games)[0]]
      }
    }

    if (game) {
      getDominantColor(game.coverUrl, (palette) => {
        this.setState({dominantColor: getDominantColor.toCSS(getDominantColor.pick(palette))})
      })
    }
  }
}

HubSidebarItem.propTypes = {
  index: PropTypes.number,
  path: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([ PropTypes.string, PropTypes.array ]).isRequired,
  active: PropTypes.bool.isRequired,
  count: PropTypes.number,
  kbShortcut: PropTypes.node,

  onClick: PropTypes.func.isRequired,
  onContextMenu: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  moveTab: PropTypes.func,
  data: PropTypes.object,

  isDragging: PropTypes.bool.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
}

const tabSource = {
  beginDrag (props) {
    return {
      path: props.path,
      index: props.index
    }
  }
}

const tabTarget = {
  hover (props, monitor, component) {
    const dragIndex = monitor.getItem().index
    const hoverIndex = props.index

    if (typeof dragIndex !== 'number' || typeof hoverIndex !== 'number') {
      // some tabs are undroppable
      // console.log('ignoring ', dragIndex, hoverIndex)
      return
    }

    // console.log('hovering ', dragIndex, hoverIndex)

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect()

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

    // Determine mouse position
    const clientOffset = monitor.getClientOffset()

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return
    }

    // Time to actually perform the action
    props.moveTab(dragIndex, hoverIndex)

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex
  }
}

export default DragSource(
  draggableTypes.TAB,
  tabSource,
  (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  })
)(DropTarget(
  draggableTypes.TAB,
  tabTarget,
  (connect) => ({
    connectDropTarget: connect.dropTarget()
  })
)(HubSidebarItem))
