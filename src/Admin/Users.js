import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Moment from 'react-moment';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import * as apiAdmin from '../api/admin';
import { goTo } from '../core/navigation';
import { translate } from '../core/i18n';
import displayObject from '../helpers/display-object';
import getProperty from '../helpers/get-user-property';
import USER_STATUS from '../constants/USER_STATUS';

const USER_TYPES = {
    CLIENT: 1, // client
    
    STUDENT: 2 // student
};

const INVERSE_USER_STATUS = {};
const INVERSE_USER_TYPES = {};
Object
    .keys(USER_STATUS)
    .forEach(statusName => {
        INVERSE_USER_STATUS[USER_STATUS[statusName]] = statusName;
    });

Object
.keys(USER_TYPES)
.forEach(statusName => {
    INVERSE_USER_TYPES[USER_TYPES[statusName]] = statusName;
});

export default class SectionUsers extends React.Component {
    constructor() {
        super();
        this.state = {
            showProperty: false,
            showDetails: false,
            selectedUserId: null,
            isBlockingUser: false,
            users: []
        };
    }
    componentDidMount() {
        apiAdmin.users
        .getItems()
        .then(users => {
            this.setState({ 
                users
            });
        });
    }
    render() {
            return (
                <div className="row">
                    <div className="col-xs-12">
                            <h1>Users</h1>
                            <p className="text-muted">
                                Each User can be either a Demand, Supply or both Demand/Supply. Read more about user types <a href="https://vqlabs.freshdesk.com/solution/articles/33000212957-demand-supply-model" target="_blank">here</a>.
                            </p>
                    </div>
                    <div className="col-xs-12">
                        <div className="col-xs-3 col-sm-3">
                            <DropDownMenu
                                style={{
                                    width: '100%'
                                }}
                                value={this.state.userTypeFilter}
                                onChange={(_, _2, userTypeFilter) => {
                                    this.setState({
                                        userTypeFilter
                                    });
                                }}
                            >
                                    <MenuItem
                                        value={undefined}
                                        primaryText="All user types"
                                    />
                                    <MenuItem
                                        value={1}
                                        primaryText={'Demand (User Type 1)'}
                                    />
                                    <MenuItem
                                        value={2}
                                        primaryText={'Supply (User Type 2)'}
                                    />
                                    <MenuItem
                                        value={3}
                                        primaryText={'Demand&Supply (User Type 3)'}
                                    />
                            </DropDownMenu>
                        </div>
                        <div className="col-xs-3 col-sm-3">
                            <DropDownMenu
                                style={{
                                    width: '100%'
                                }}
                                value={this.state.statusFilter}
                                onChange={(_, _2, statusFilter) => {
                                this.setState({
                                    statusFilter
                                })
                            }}>
                                <MenuItem value={undefined} primaryText="No filter" />
                                {
                                    Object.keys(USER_STATUS)
                                    .map(status => 
                                        <MenuItem
                                            value={USER_STATUS[status]}
                                            primaryText={status}
                                        />
                                    )
                                }
                            </DropDownMenu>
                        </div>
                        <div className="col-xs-3 col-sm-2">
                            <RaisedButton style={{
                                marginTop: 12
                            }} onClick={() => {
                                alert("Contact support for exporting data.");
                            }} label="Export" />
                        </div>
                    </div>
                    <div className="col-xs-12">
                        <table className="table">
                            <thead class="thead-dark">
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Joined</th>
                                    <th scope="col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                            { this.state.users
                            .filter(user => {
                                if (!this.state.statusFilter && this.state.userTypeFilter) {
                                    return this.state.userTypeFilter === user.userType;
                                }

                                if (this.state.statusFilter && !this.state.userTypeFilter) {
                                    return this.state.statusFilter === user.status;
                                }

                                if (this.state.statusFilter && this.state.userTypeFilter) {
                                    return this.state.statusFilter === user.status &&
                                        this.state.userTypeFilter === user.userType;
                                }
                                
                                return true;
                            })
                            .map(user => 
                                <tr>
                                   <td>
                                        <a href="#" onClick={() => goTo(`/profile/${user.id}`)}>{user.id}</a>
                                   </td>
                                   <td>
                                        <a href="#" onClick={() => {
                                            apiAdmin.users
                                                .getUserEmail(user.id)
                                                .then(userEmails => {
                                                    this.setState({
                                                        showDetails: true,
                                                        selectedUser: userEmails
                                                    })
                                                });
                                        }}>Email</a>
                                    </td>
                                    <td>
                                        {user.firstName} {user.lastName}
                                    </td>
                                    <td>
                                        {String(user.userType) === '1' ? 'DEMAND' : 'SUPPLY'}
                                    </td>
                                    <td>
                                        {INVERSE_USER_STATUS[String(user.status)] || 'UNVERIFIED'}
                                    </td>
                                    <td>
                                        <Moment format={`DD.MM.YYYY, HH.mm`}>{user.createdAt}</Moment>
                                    </td>
                                    <td>
                                        <a className="vq-row-option" href="#" onClick={() => {
                                            apiAdmin
                                            .users
                                            .getUserProperties(user.id)
                                            .then(userProperties => {
                                                this.setState({
                                                    userProperties,
                                                    showProperty: true,
                                                    selectedUser: user
                                                });
                                            })
                                        }}>Verifications</a>

                                        <a className="vq-row-option" href="#" onClick={() => {
                                            this.setState({
                                                isUnblockingUser: true,
                                                selectedUserId: user.id
                                            })
                                        }}>Block</a>

                                        <a className="vq-row-option" href="#" onClick={() => {
                                            this.setState({
                                                showDetails: true,
                                                selectedUser: user
                                            })
                                        }}>More</a>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    <div>
                        <Dialog
                            actions={[
                                <FlatButton
                                    label={translate('CANCEL')}
                                    primary={true}
                                    onTouchTap={() => this.setState({
                                        isBlockingUser: false,
                                        isUnblockingUser: false,
                                        selectedUserId: null
                                    })
                                    }
                                />,
                                <FlatButton
                                    label={translate('CONFIRM')}
                                    primary={true}
                                    onTouchTap={() => {
                                        const users = this.state.users;
                                        const userId = this.state.selectedUserId;
                                        const isBlocking = this.state.isBlockingUser;
                                        const USER_STATUS_BLOCKED = isBlocking ? '20' : '10';

                                        apiAdmin
                                            .users[
                                                isBlocking ? 'blockUser' : 'unblockUser'
                                            ](userId)
                                            .then(_ => {
                                                alert('OK! User Blocked!');

                                                users
                                                .find(_ => _.id === userId)
                                                .status = USER_STATUS_BLOCKED;

                                                this.setState({
                                                    users,
                                                    isBlockingUser: false,
                                                    isUnblockingUser: false,
                                                    selectedUserId: null
                                                });
                                            }, err => {
                                                return alert(JSON.stringify(err));
                                            });
                                    }}
                                />,
                            ]}
                            modal={false}
                            open={this.state.isBlockingUser || this.state.isUnblockingUser}
                            >
                                { this.state.isBlockingUser && <h1>Block user #{this.state.selectedUserId}</h1> }
                                { !this.state.isBlockingUser && <h1>Unblock user #{this.state.selectedUserId}</h1> }

                                <p>
                                Read in VQ-MARKETPLACE Solution Center: <br />
                                <a target="_blank" href="https://vqlabs.freshdesk.com/support/solutions/articles/33000166411-blocking-unblocking-users">
                                        What happens when Admin blocks/unblock a user?
                                </a>
                                </p>
                            </Dialog>

                            <div>
                                <Dialog
                                    autoScrollBodyContent={true}
                                    actions={[
                                        <FlatButton
                                            label={'OK'}
                                            primary={true}
                                            onTouchTap={() => this.setState({
                                                showDetails: false,
                                                selectedUser: null
                                            })}
                                        />
                                    ]}
                                    modal={false}
                                    open={this.state.showDetails}
                                    >
                                        <div className="container">
                                            { displayObject(this.state.selectedUser || {}, {
                                                doNotTrim: true,
                                                fields: {
                                                    description: {
                                                        type: 'html'
                                                    }
                                                }
                                            })}
                                        </div>
                                </Dialog>
                            </div>


                            <div>
                                <Dialog
                                    autoScrollBodyContent={true}
                                    actions={[
                                        <FlatButton
                                            label={'OK'}
                                            primary={true}
                                            onTouchTap={() => this.setState({
                                                showProperty: false,
                                                propertyName: null,
                                                selectedUser: null,
                                            })}
                                        />,
                                        <FlatButton
                                                label="Remove verifications"
                                                onTouchTap={() => {
                                                    apiAdmin
                                                    .users
                                                    .removeVerifications(this.state.selectedUser.id)
                                                    .then(_ => {
                                                        location.reload();
                                                    })
                                                }}
                                        />
                                    ]}
                                    modal={false}
                                    open={this.state.showProperty}
                                    >
                                        <div className="container">
                                            <div className="col-xs-12">
                                                { this.state.showProperty &&
                                                    getProperty({
                                                        userProperties: this.state.userProperties
                                                    }, 'studentIdUrl')
                                                    &&    
                                                    <img
                                                        alt="presentation"
                                                        width={400}
                                                        height={400}
                                                        src={getProperty({
                                                            userProperties: this.state.userProperties
                                                        }, 'studentIdUrl')}
                                                    />
                                                }

                                                { this.state.showProperty &&
                                                    <div className="row">
                                                        {getProperty({
                                                            userProperties: this.state.userProperties
                                                        }, 'studentIdUrl') &&
                                                            <div className="col-xs-12">
                                                                <a href={getProperty({
                                                                    userProperties: this.state.userProperties
                                                                }, 'studentIdUrl')} target="_blank">Front: Open in a separate page</a>
                                                            </div>
                                                        }
                                                    </div>
                                                }
                                            </div>
                                            
                                            <div className="col-xs-12" style={{
                                                marginTop: 20
                                            }}>
                                                { this.state.showProperty &&
                                                    getProperty({
                                                        userProperties: this.state.userProperties
                                                    }, 'studentIdBackUrl') &&
                                                    <img
                                                        alt="presentation"
                                                        width={400}
                                                        height={400}
                                                        src={getProperty({
                                                            userProperties: this.state.userProperties
                                                        }, 'studentIdBackUrl')}
                                                    />
                                                }
                                                { this.state.showProperty &&
                                                    <div className="row">
                                                        {getProperty({
                                                            userProperties: this.state.userProperties
                                                        }, 'studentIdBackUrl') &&
                                                            <div className="col-xs-12">
                                                                <a href={getProperty({
                                                                    userProperties: this.state.userProperties
                                                                }, 'studentIdBackUrl')} target="_blank">Back: Open in a separate page</a>
                                                            </div>
                                                        }
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                </Dialog>
                            </div>
                        </div>
                     </div>
            );
    }
};
