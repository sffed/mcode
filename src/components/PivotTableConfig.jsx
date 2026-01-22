import React from 'react';
import { Settings, Filter } from 'lucide-react';

const PivotTableConfig = ({
  columns,
  columnTypes,
  groupBy,
  setGroupBy,
  aggregateBy,
  setAggregateBy,
  aggregateFunc,
  setAggregateFunc,
  chartType,
  setChartType,
  timeGroup,
  setTimeGroup,
}) => {
  const numericColumns = columns.filter(col => columnTypes[col] === 'number');
  const categoricalColumns = columns.filter(col => columnTypes[col] !== 'number');
  const dateColumns = columns.filter(col => columnTypes[col] === 'date');

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-800">图表配置</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            图表类型
          </label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="bar">柱状图</option>
            <option value="line">折线图</option>
            <option value="area">面积图</option>
            <option value="pie">饼图</option>
            <option value="scatter">散点图</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            分组维度 (X轴)
          </label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">选择分组列</option>
            {categoricalColumns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
            {dateColumns.map(col => (
              <option key={col} value={col}>{col} (日期)</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            聚合指标 (Y轴)
          </label>
          <select
            value={aggregateBy}
            onChange={(e) => setAggregateBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={numericColumns.length === 0}
          >
            <option value="">选择数值列</option>
            {numericColumns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
          {numericColumns.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">没有数值列可供选择</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            聚合方式
          </label>
          <select
            value={aggregateFunc}
            onChange={(e) => setAggregateFunc(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="sum">求和</option>
            <option value="avg">平均值</option>
            <option value="count">计数</option>
            <option value="max">最大值</option>
            <option value="min">最小值</option>
          </select>
        </div>

        {columnTypes[groupBy] === 'date' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                日期分组方式
              </div>
            </label>
            <select
              value={timeGroup}
              onChange={(e) => setTimeGroup(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="day">按天</option>
              <option value="month">按月</option>
              <option value="year">按年</option>
            </select>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">当前配置</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>图表:</strong> {getChartTypeName(chartType)}</p>
          <p><strong>分组:</strong> {groupBy || '未选择'}</p>
          <p><strong>聚合:</strong> {aggregateBy || '未选择'}</p>
          <p><strong>方式:</strong> {getAggregateFuncName(aggregateFunc)}</p>
        </div>
      </div>
    </div>
  );
};

const getChartTypeName = (type) => {
  const names = {
    bar: '柱状图',
    line: '折线图',
    area: '面积图',
    pie: '饼图',
    scatter: '散点图',
  };
  return names[type] || type;
};

const getAggregateFuncName = (func) => {
  const names = {
    sum: '求和',
    avg: '平均值',
    count: '计数',
    max: '最大值',
    min: '最小值',
  };
  return names[func] || func;
};

export default PivotTableConfig;
