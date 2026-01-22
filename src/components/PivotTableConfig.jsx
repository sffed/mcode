import React from 'react';
import { Settings, Filter, Palette, Sliders, Calendar } from 'lucide-react';

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
  showGrid,
  setShowGrid,
  showLegend,
  setShowLegend,
  chartTitle,
  setChartTitle,
  chartColor,
  setChartColor,
  labelPosition,
  setLabelPosition,
  xAxisLabel,
  setXAxisLabel,
  yAxisLabel,
  setYAxisLabel,
  data,
}) => {
  const numericColumns = columns.filter(col => columnTypes[col] === 'number');

  // 获取所有可用于Y轴聚合的列（排除分组维度和日期列）
  const yAxisColumns = columns.filter(col => {
    // 排除分组维度
    if (col === groupBy) return false;

    // 排除日期列（日期列不适合作为Y轴聚合）
    if (columnTypes[col] === 'date') return false;

    // 包含数字类型
    if (columnTypes[col] === 'number') return true;

    // 文本类型但可能包含数值数据
    return true;
  });

  const categoricalColumns = columns.filter(col => columnTypes[col] !== 'number' && columnTypes[col] !== 'date');
  const dateColumns = columns.filter(col => columnTypes[col] === 'date');

  const chartTypes = [
    { value: 'bar', label: '柱状图', icon: '📊' },
    { value: 'line', label: '折线图', icon: '📈' },
    { value: 'area', label: '面积图', icon: '📉' },
    { value: 'pie', label: '饼图', icon: '🥧' },
    { value: 'scatter', label: '散点图', icon: '⚪' },
    { value: 'radar', label: '雷达图', icon: '🕸️' },
    { value: 'doughnut', label: '甜甜圈图', icon: '🍩' },
    { value: 'barStacked', label: '堆叠柱状图', icon: '📊' },
  ];

  const colors = [
    { value: 'blue', label: '蓝色系', colors: ['#3B82F6', '#60A5FA', '#93C5FD'] },
    { value: 'green', label: '绿色系', colors: ['#10B981', '#34D399', '#6EE7B7'] },
    { value: 'purple', label: '紫色系', colors: ['#8B5CF6', '#A78BFA', '#C4B5FD'] },
    { value: 'orange', label: '橙色系', colors: ['#F59E0B', '#FBBF24', '#FCD34D'] },
    { value: 'red', label: '红色系', colors: ['#EF4444', '#F87171', '#FCA5A5'] },
    { value: 'multicolor', label: '多彩色', colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'] },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-800">图表配置</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            图表标题
          </label>
          <input
            type="text"
            value={chartTitle}
            onChange={(e) => setChartTitle(e.target.value)}
            placeholder="输入图表标题"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            图表类型
          </label>
          <div className="grid grid-cols-2 gap-2">
            {chartTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setChartType(type.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  chartType === type.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-base">{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            分组维度 (X轴)
          </label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
          >
            <option value="">选择分组列</option>
            {dateColumns.map(col => (
              <option key={col} value={col}>{col} 📅</option>
            ))}
            {categoricalColumns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
          {dateColumns.length === 0 && categoricalColumns.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">没有可分组的列</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            聚合指标 (Y轴)
          </label>
          <select
            value={aggregateBy}
            onChange={(e) => setAggregateBy(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            disabled={yAxisColumns.length === 0}
          >
            <option value="">选择数值列</option>
            {yAxisColumns.map(col => (
              <option key={col} value={col}>
                {col} {columnTypes[col] === 'number' ? '📊' : '📝'}
              </option>
            ))}
          </select>
          {yAxisColumns.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">没有数值列可供选择</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            聚合方式
          </label>
          <select
            value={aggregateFunc}
            onChange={(e) => setAggregateFunc(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
          >
            <option value="sum">求和 Σ</option>
            <option value="avg">平均值 μ</option>
            <option value="count">计数 N</option>
            <option value="max">最大值 ↑</option>
            <option value="min">最小值 ↓</option>
          </select>
        </div>

        {columnTypes[groupBy] === 'date' && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                日期分组方式
              </div>
            </label>
            <select
              value={timeGroup}
              onChange={(e) => setTimeGroup(e.target.value)}
              className="w-full px-4 py-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option value="day">按天 📅</option>
              <option value="week">按周 📆</option>
              <option value="month">按月 🗓️</option>
              <option value="quarter">按季度 📊</option>
              <option value="year">按年 🗓️</option>
            </select>
          </div>
        )}

        <div className="border-t pt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-600" />
              图表样式
            </div>
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                配色方案
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setChartColor(color.value)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      chartColor === color.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex gap-0.5">
                      {color.colors.slice(0, 3).map((c, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <span>{color.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                显示网格
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLegend}
                  onChange={(e) => setShowLegend(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                显示图例
              </label>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              轴标签设置
            </div>
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                X轴标签
              </label>
              <input
                type="text"
                value={xAxisLabel}
                onChange={(e) => setXAxisLabel(e.target.value)}
                placeholder="自定义X轴标签"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Y轴标签
              </label>
              <input
                type="text"
                value={yAxisLabel}
                onChange={(e) => setYAxisLabel(e.target.value)}
                placeholder="自定义Y轴标签"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                标签位置
              </label>
              <select
                value={labelPosition}
                onChange={(e) => setLabelPosition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option value="auto">自动</option>
                <option value="top">顶部</option>
                <option value="bottom">底部</option>
                <option value="left">左侧</option>
                <option value="right">右侧</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          当前配置
        </h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>图表:</strong> {getChartTypeName(chartType)}</p>
          <p><strong>分组:</strong> {groupBy || '未选择'}</p>
          <p><strong>聚合:</strong> {aggregateBy || '未选择'}</p>
          <p><strong>方式:</strong> {getAggregateFuncName(aggregateFunc)}</p>
          {columnTypes[groupBy] === 'date' && (
            <p><strong>日期分组:</strong> {getTimeGroupName(timeGroup)}</p>
          )}
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
    radar: '雷达图',
    doughnut: '甜甜圈图',
    barStacked: '堆叠柱状图',
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

const getTimeGroupName = (group) => {
  const names = {
    day: '按天',
    week: '按周',
    month: '按月',
    quarter: '按季度',
    year: '按年',
  };
  return names[group] || group;
};

export default PivotTableConfig;
