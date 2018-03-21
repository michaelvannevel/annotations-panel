///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(['lodash', 'app/plugins/sdk', 'moment', './css/annolist.css!'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var lodash_1, sdk_1, moment_1;
    var AnnoListCtrl;
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (moment_1_1) {
                moment_1 = moment_1_1;
            },
            function (_1) {}],
        execute: function() {
            AnnoListCtrl = (function (_super) {
                __extends(AnnoListCtrl, _super);
                /** @ngInject */
                function AnnoListCtrl($scope, $injector, $rootScope, backendSrv, dashboardSrv, timeSrv, $location) {
                    _super.call(this, $scope, $injector);
                    this.$rootScope = $rootScope;
                    this.backendSrv = backendSrv;
                    this.dashboardSrv = dashboardSrv;
                    this.timeSrv = timeSrv;
                    this.$location = $location;
                    this.found = [];
                    lodash_1.default.defaults(this.panel, AnnoListCtrl.panelDefaults);
                    $scope.moment = moment_1.default;
                    this.events.on('refresh', this.onRefresh.bind(this));
                    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
                }
                AnnoListCtrl.prototype.onInitEditMode = function () {
                    this.editorTabIndex = 1;
                    this.addEditorTab('Options', 'public/plugins/ryantxu-annolist-panel/editor.html');
                };
                AnnoListCtrl.prototype.onRefresh = function () {
                    var promises = [];
                    promises.push(this.getSearch());
                    return Promise.all(promises).then(this.renderingCompleted.bind(this));
                };
                AnnoListCtrl.prototype.getSearch = function () {
                    // http://docs.grafana.org/http_api/annotations/
                    // https://github.com/grafana/grafana/blob/master/public/app/core/services/backend_srv.ts
                    // https://github.com/grafana/grafana/blob/master/public/app/features/annotations/annotations_srv.ts
                    var _this = this;
                    var params = {
                        tags: this.panel.tags,
                        limit: this.panel.limit,
                    };
                    if (this.panel.onlyFromThisDashboard) {
                        params.dashboardId = this.dashboard.id;
                    }
                    return this.backendSrv.get('/api/annotations', params).then(function (result) {
                        _this.found = result;
                    });
                };
                AnnoListCtrl.prototype._timeOffset = function (time, offset, subtract) {
                    if (subtract === void 0) { subtract = false; }
                    var incr = 5;
                    var unit = 'm';
                    var parts = /^(\d+)(\w)/.exec(offset);
                    if (parts && parts.length === 3) {
                        incr = parseInt(parts[1]);
                        unit = parts[2];
                    }
                    var t = moment_1.default.utc(time);
                    if (subtract) {
                        incr *= -1;
                    }
                    t.add(incr, unit);
                    return t;
                };
                AnnoListCtrl.prototype.selectAnno = function (anno, evt) {
                    var _this = this;
                    if (evt) {
                        evt.stopPropagation();
                        evt.preventDefault();
                    }
                    var range = {
                        from: this._timeOffset(anno.time, this.panel.navigateBefore, true),
                        to: this._timeOffset(anno.time, this.panel.navigateAfter, false),
                    };
                    // Link to the panel on the same dashboard
                    if (this.dashboard.id === anno.dasboardId) {
                        this.timeSrv.setTime(range);
                        if (this.panel.navigateToPanel) {
                            this.$location.search('panelId', anno.panelId);
                            this.$location.search('fullscreen', true);
                        }
                        return;
                    }
                    if (anno.dashboardId === 0) {
                        this.$rootScope.appEvent('alert-warning', [
                            'Invalid Annotation Dashboard',
                            'Annotation on dashboard: 0 (new?)',
                        ]);
                        return;
                    }
                    this.backendSrv.get('/api/search', { dashboardIds: anno.dashboardId }).then(function (res) {
                        if (res && res.length === 1 && res[0].id === anno.dashboardId) {
                            var dash = res[0];
                            var path = dash.url;
                            if (!path) {
                                // before v5.
                                path = '/dashboard/' + dash.uri;
                            }
                            var params = {
                                from: range.from.valueOf().toString(),
                                to: range.to.valueOf().toString(),
                            };
                            if (_this.panel.navigateToPanel) {
                                params.panelId = anno.panelId;
                                params.fullscreen = true;
                            }
                            var orgId = _this.$location.search().orgId;
                            if (orgId) {
                                params.orgId = orgId;
                            }
                            console.log('SEARCH', path, params);
                            _this.$location.path(path).search(params);
                        }
                        else {
                            console.log('Unable to find dashboard...', anno);
                            _this.$rootScope.appEvent('alert-warning', [
                                'Unknown Dashboard: ' + anno.dashboardId,
                            ]);
                        }
                    });
                };
                AnnoListCtrl.prototype.selectTag = function (anno, tag, evt) {
                    console.log('TAG', anno, tag);
                    if (evt) {
                        evt.stopPropagation();
                        evt.preventDefault();
                    }
                };
                AnnoListCtrl.templateUrl = 'module.html';
                AnnoListCtrl.scrollable = true;
                AnnoListCtrl.panelDefaults = {
                    limit: 10,
                    tags: [],
                    onlyFromThisDashboard: false,
                    showTags: true,
                    showUser: true,
                    showTime: true,
                    navigateBefore: '10m',
                    navigateAfter: '10m',
                    navigateToPanel: true,
                };
                return AnnoListCtrl;
            })(sdk_1.PanelCtrl);
            exports_1("AnnoListCtrl", AnnoListCtrl);
            exports_1("PanelCtrl", AnnoListCtrl);
        }
    }
});
//# sourceMappingURL=module.js.map