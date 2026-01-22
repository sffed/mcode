import React, { useRef, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { Download, BarChart2, LineChart as LineChartIcon, PieChart as PieChartIcon, ScatterChart as ScatterChartIcon, Copy, Maximize2 } from 'lucide-react';
import html2canvas from 'html2canvas';

const getColorScheme = (colorScheme) => {
  const schemes = {
    blue: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
    green: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'],
    purple: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'],
    orange: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'],
    red: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'],
    multicolor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'],
  };
  return schemes[colorScheme] || schemes.multicolor;
};

const ChartDisplay = ({
  data,
  chartType,
  groupBy,
  aggregateBy,
  xAxisTitle,
  yAxisTitle,
  showGrid,
  showLegend,
  chartTitle,
  chartColor,
  labelPosition,
  customXAxisLabel,
  customYAxisLabel,
}) => {
  const chartRef = useRef(null);
  const colors = useMemo(() => getColorScheme(chartColor), [chartColor]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
        <BarChart2 className="w-20 h-20 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 font-medium">暂无数据，请配置图表选项</p>
        <p className="text-gray-500 text-sm mt-2">选择分组维度和聚合指标以生成图表</p>
      </div>
    );
  }

  const handleDownloadImage = async () => {
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
        });
        const link = document.createElement('a');
        link.download = `${chartTitle || 'chart'}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('下载失败:', error);
      }
    }
  };

  const getXAxisLabelPosition = () => {
    const positions = {
      auto: { position: 'insideBottom', offset: -10 },
      top: { position: 'insideTop', offset: 20 },
      bottom: { position: 'insideBottom', offset: -10 },
      left: { position: 'insideLeft', angle: -90 },
      right: { position: 'insideRight', angle: 90 },
    };
    return positions[labelPosition] || positions.auto;
  };

  const getYAxisLabelPosition = () => {
    const positions = {
      auto: { position: 'insideLeft', angle: -90 },
      top: { position: 'insideTop' },
      bottom: { position: 'insideBottom' },
      left: { position: 'insideLeft', angle: -90 },
      right: { position: 'insideRight', angle: 90 },
    };
    return positions[labelPosition] || positions.auto;
  };

  const chartData = data.map((item, index) => ({
    name: item[groupBy],
    value: parseFloat(item[aggregateBy]),
    fill: colors[index % colors.length],
  }));

  const commonMargin = { top: 40, right: 40, left: 80, bottom: 80 };
  const commonProps = {
    margin: commonMargin,
    data: chartData,
  };

  const getXAxisProps = () => {
    const axisProps = {
      dataKey: 'name',
      angle: chartData.length > 8 ? -45 : 0,
      textAnchor: chartData.length > 8 ? 'end' : 'middle',
      height: chartData.length > 8 ? 100 : 50,
      tick: { fontSize: 11 },
    };

    const label = customXAxisLabel || xAxisTitle;
    if (label) {
      axisProps.label = {
        value: label,
        ...getXAxisLabelPosition(),
        style: { fontWeight: 'bold', fontSize: 12 },
      };
    }

    return axisProps;
  };

  const getYAxisProps = () => {
    const axisProps = {
      tick: { fontSize: 11 },
    };

    const label = customYAxisLabel || yAxisTitle;
    if (label) {
      axisProps.label = {
        value: label,
        ...getYAxisLabelPosition(),
        style: { fontWeight: 'bold', fontSize: 12 },
      };
    }

    return axisProps;
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
            <XAxis {...getXAxisProps()} />
            <YAxis {...getYAxisProps()} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              formatter={(value) => [parseFloat(value).toLocaleString(), aggregateBy]}
            />
            {showLegend && <Legend verticalAlign="top" height={36} />}
            <Bar dataKey="value" fill={colors[0]} radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        );

      case 'barStacked':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
            <XAxis {...getXAxisProps()} />
            <YAxis {...getYAxisProps()} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            {showLegend && <Legend verticalAlign="top" height={36} />}
            <Bar dataKey="value" fill={colors[0]} radius={[6, 6, 0, 0]} stackId="stack">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
            <XAxis {...getXAxisProps()} />
            <YAxis {...getYAxisProps()} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              formatter={(value) => [parseFloat(value).toLocaleString(), aggregateBy]}
            />
            {showLegend && <Legend verticalAlign="top" height={36} />}
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              strokeWidth={3}
              dot={{ fill: colors[0], strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: colors[0], strokeWidth: 3 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
            <XAxis {...getXAxisProps()} />
            <YAxis {...getYAxisProps()} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              formatter={(value) => [parseFloat(value).toLocaleString(), aggregateBy]}
            />
            {showLegend && <Legend verticalAlign="top" height={36} />}
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.4}
              strokeWidth={2}
            />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart margin={{ top: 20, right: 40, left: 40, bottom: 20 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              outerRadius={140}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              formatter={(value) => [parseFloat(value).toLocaleString(), aggregateBy]}
            />
            {showLegend && <Legend verticalAlign="bottom" height={50} />}
          </PieChart>
        );

      case 'doughnut':
        return (
          <PieChart margin={{ top: 20, right: 40, left: 40, bottom: 20 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              outerRadius={140}
              innerRadius={70}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              formatter={(value) => [parseFloat(value).toLocaleString(), aggregateBy]}
            />
            {showLegend && <Legend verticalAlign="bottom" height={50} />}
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
            <XAxis {...getXAxisProps()} />
            <YAxis {...getYAxisProps()} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              formatter={(value) => [parseFloat(value).toLocaleString(), aggregateBy]}
            />
            {showLegend && <Legend verticalAlign="top" height={36} />}
            <Scatter name="数据点" data={chartData} fill={colors[0]} shape="circle">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        );

      case 'radar':
        const radarData = chartData.map(item => ({
          category: item.name,
          value: item.value,
        }));

        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="#e0e0e0" />
            <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
            <PolarRadiusAxis tick={{ fontSize: 10 }} />
            <Radar
              name={aggregateBy}
              dataKey="value"
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.4}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              formatter={(value) => [parseFloat(value).toLocaleString(), aggregateBy]}
            />
            {showLegend && <Legend verticalAlign="top" height={36} />}
          </RadarChart>
        );

      default:
        return null;
    }
  };

  const getChartIcon = () => {
    switch (chartType) {
      case 'bar':
      case 'barStacked':
        return <BarChart2 className="w-6 h-6" />;
      case 'line':
        return <LineChartIcon className="w-6 h-6" />;
      case 'area':
        return <AreaChartIcon className="w-6 h-6" />;
      case 'pie':
      case 'doughnut':
        return <PieChartIcon className="w-6 h-6" />;
      case 'scatter':
        return <ScatterChartIcon className="w-6 h-6" />;
      case 'radar':
        return <RadarChartIcon className="w-6 h-6" />;
      default:
        return <BarChart2 className="w-6 h-6" />;
    }
  };

  const stats = useMemo(() => {
    if (!data.length) return null;

    const values = data.map(item => parseFloat(item[aggregateBy] || 0));
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    return { sum, avg, max, min, count: values.length };
  }, [data, aggregateBy]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            {getChartIcon()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{chartTitle || '图表预览'}</h2>
            <p className="text-sm text-gray-500">{data.length} 个数据点</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadImage}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            title="下载为图片"
          >
            <Download className="w-4 h-4" />
            保存图片
          </button>
        </div>
      </div>

      <div ref={chartRef} className="w-full h-[550px] bg-gradient-to-br from-white to-gray-50 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {stats && (
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-600 font-medium mb-1">总计</p>
            <p className="text-lg font-bold text-blue-800">{stats.sum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-xs text-green-600 font-medium mb-1">平均值</p>
            <p className="text-lg font-bold text-green-800">{stats.avg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-xs text-orange-600 font-medium mb-1">最大值</p>
            <p className="text-lg font-bold text-orange-800">{stats.max.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-600 font-medium mb-1">最小值</p>
            <p className="text-lg font-bold text-purple-800">{stats.min.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const AreaChartIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

const RadarChartIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2v20" />
    <path d="M2 12h20" />
    <path d="M12 2 2 12l10 10 10-10L12 2z" />
    <path d="M12 2 2 12" />
    <path d="M12 2l10 10" />
    <path d="M12 22 2 12" />
    <path d="M12 22l10-10" />
  </svg>
);

export default ChartDisplay;
