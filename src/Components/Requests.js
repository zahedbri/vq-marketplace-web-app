import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import IconCall from 'material-ui/svg-icons/communication/call';
import IconChatBubble from 'material-ui/svg-icons/communication/chat-bubble';
import Avatar from 'material-ui/Avatar';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import ListingHeader from '../Components/ListingHeader';
import Moment from 'react-moment';
import * as apiRequest from '../api/request';
import { displayPrice, displayLocation } from '../core/format';
import { goTo } from '../core/navigation';
import { translate } from '../core/i18n';
import { openConfirmDialog } from '../helpers/confirm-before-action.js';
import { openDialog as openMessageDialog } from '../helpers/open-message-dialog.js';
import { getConfigAsync } from '../core/config';
import displayTaskTiming from '../helpers/display-task-timing';
import getUserProperty from '../helpers/get-user-property';
import { factory as errorFactory } from '../core/error-handler';
import REQUEST_STATUS from '../constants/REQUEST_STATUS';

export default class Requests extends Component {
  constructor(props) {
      super();

      this.state = {
        view: props.view,
        open: false,
        isLoading: true,
        requests: []
      };
  }
  
  componentDidMount() {
    getConfigAsync(config => {
        const queryObj = {};

        if (this.state.view) {
            queryObj.view = this.state.view;
        }

        apiRequest
            .getItems(queryObj)
            .then(requests => {
                this.setState({
                    config,
                    requests,
                    ready: true,
                    isLoading: false
                });

                this.props.onReady && this.props.onReady();
            });
    });
  }

  markAsDone = request => {
    openConfirmDialog({
        headerLabel: translate('REQUEST_ACTION_MARK_DONE'),
        confirmationLabel: translate('REQUEST_ACTION_MARK_DONE_DESC')
    }, () => {
        const requests = this.state.requests;

        apiRequest
            .updateItem(request.id, {
                status: REQUEST_STATUS.MARKED_DONE
            }).then(_ => {
                const requestRef = requests
                    .find(_ => _.id === request.id);

                requestRef.status = REQUEST_STATUS.MARKED_DONE;

                requestRef.order.autoSettlementStartedAt = new Date();
        
                this.setState({
                    requests
                });

                return openMessageDialog({
                    header: translate("SUCCESS")
                });
            }, errorFactory());
    });
  }

  cancelRequest = request => {
    openConfirmDialog({}, () => {
        const requests = this.state.requests;
        
        apiRequest.updateItem(request.id, {
            status: REQUEST_STATUS.CANCELED
        }).then(_ => {
            requests
                .find(_ => _.id === request.id)
                .status = REQUEST_STATUS.CANCELED;
    
            this.setState({
                requests
            });

            return openMessageDialog({
                header: translate("SUCCESS")
            });
        }, errorFactory());
    })
  };

  handleClose = () => {
    this.setState({
        selectedOrderId: null,
        open: false
    });
  };

  shouldShowPhoneNumber = request => {
    return request.status === REQUEST_STATUS.ACCEPTED ||
    request.status === REQUEST_STATUS.MARKED_DONE;
  }

  shouldAllowCancel = request => {
      return request.status === REQUEST_STATUS.PENDING;
        /**
         request.status != REQUEST_STATUS.CANCELED &&
         request.status != REQUEST_STATUS.MARKED_DONE &&
         request.status != REQUEST_STATUS.SETTLED &&
         request.status != REQUEST_STATUS.ACCEPTED;
        */
  }

  shouldAllowMarkingAsDone = request => {
      return request.status === REQUEST_STATUS.ACCEPTED;
  }

  render() {
    return (
        <div className="container">
            { this.state.ready &&
                <div className="row">
                    <div className="col-xs-12">
                    { this.props.showTitle &&
                        <h1 style={{color: this.state.config.COLOR_PRIMARY}}>
                            {translate('YOUR_REQUESTS')}
                        </h1>
                    }
                    { !this.state.isLoading && !this.state.requests.length &&
                        <div className="col-xs-12">
                            <div className="row">
                                <p className="text-muted">{translate("NO_REQUESTS")}</p>
                            </div>
                        </div>
                    }
                    { !this.state.isLoading && this.state.requests
                        .map(request =>
                            <div
                                className="col-xs-12"
                                style={{ marginTop: 10 }}
                            >
                                <Paper
                                    style={{ padding: 10 }}>
                                    <ListingHeader
                                        task={request.task}
                                        config={this.state.config}
                                    />
                                    <div className="row">
                                        <div className="col-xs-12 col-sm-6 text-left"> 
                                            <p className="text-muted" style={{ marginTop: 18 }}>
                                                <strong>
                                                    { String(request.status) === REQUEST_STATUS.PENDING &&
                                                        translate("REQUEST_STATUS_PENDING")
                                                    }
                                                    { String(request.status) === REQUEST_STATUS.ACCEPTED &&
                                                        translate("REQUEST_STATUS_ACCEPTED")
                                                    }
                                                    { String(request.status) === REQUEST_STATUS.MARKED_DONE &&
                                                        <span>
                                                            {translate("REQUEST_STATUS_MARKED_DONE")} ({translate("ORDER_AUTOSETTLEMENT_ON")} <Moment format="DD.MM.YYYY, HH:MM">{(new Date(request.order.autoSettlementStartedAt).addHours(8))}</Moment>)
                                                        </span>
                                                    }
                                                    { String(request.status) === REQUEST_STATUS.SETTLED &&
                                                        translate("REQUEST_STATUS_SETTLED")
                                                    }
                                                    { String(request.status) === REQUEST_STATUS.DECLINED &&
                                                        translate("REQUEST_STATUS_DECLINED")
                                                    }
                                                    { String(request.status) === REQUEST_STATUS.CANCELED &&
                                                        translate("REQUEST_STATUS_CANCELED")
                                                    }
                                                </strong>
                                            </p>
                                        </div>
                                        <div className="col-xs-12 col-sm-6 text-right">
                                            <IconButton
                                                onClick={() => goTo(`/profile/${request.with.id}`)}
                                                tooltipPosition="top-center"
                                                tooltip={
                                                    `${request.with.firstName} ${request.with.lastName}`
                                                }
                                            >
                                                <Avatar src={request.with.imageUrl || '/images/avatar.png'} />
                                            </IconButton>
                                            { this.shouldShowPhoneNumber(request) &&
                                                <IconButton
                                                    style={{ top: 10 }}
                                                    tooltipPosition="top-center"
                                                    tooltip={
                                                        getUserProperty(request.with, 'phoneNo')
                                                    }>
                                                    <IconCall />
                                                </IconButton>
                                            }
                                            { String(request.status) !== REQUEST_STATUS.SETTLED && String(request.status) !== REQUEST_STATUS.CANCELED &&
                                                <IconButton
                                                    style={{ top: 10 }}
                                                    tooltip={'Chat'}
                                                    tooltipPosition="top-center"
                                                    onClick={() => goTo(`/chat/${request.id}`)}
                                                >
                                                    <IconChatBubble />
                                                </IconButton>
                                            }
                                            { this.shouldAllowCancel(request) &&
                                                <RaisedButton
                                                    labelStyle={{color: 'white '}}
                                                    backgroundColor={this.state.config.COLOR_PRIMARY}
                                                    label={translate('CANCEL')}
                                                    onTouchTap={() => this.cancelRequest(request)}
                                                />
                                            }
                                            { this.shouldAllowMarkingAsDone(request) &&
                                                <RaisedButton
                                                    labelStyle={{color: 'white '}}
                                                    backgroundColor={this.state.config.COLOR_PRIMARY}
                                                    label={translate('REQUEST_ACTION_MARK_DONE')}
                                                    onTouchTap={() => this.markAsDone(request)}
                                                />
                                            }

                                            {!request.review &&
                                                request.status === REQUEST_STATUS.SETTLED &&
                                                <div style={{
                                                    display: 'inline-block',
                                                    padding: 10
                                                }}>
                                                    <RaisedButton
                                                        labelStyle={{color: 'white '}}
                                                        backgroundColor={this.state.config.COLOR_PRIMARY}
                                                        label={translate('LEAVE_REVIEW')}
                                                        onTouchTap={() => {
                                                            goTo(`/request/${request.id}/review`);
                                                        }}
                                                    />
                                                </div>
                                                }
                                        </div>
                                    </div>
                            </Paper>
                        </div>
                    )}
                   
                    </div>
                </div>
            }
        </div>
      );
   }
};
