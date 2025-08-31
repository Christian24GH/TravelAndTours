import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Gauge, BookOpenCheckIcon, ChartSpline, PieChartIcon } from "lucide-react";

const summaryData = [
	{ label: "Competency", value: 82, icon: PieChartIcon, color: "#6366f1" },
	{ label: "Learning", value: 67, icon: BookOpenCheckIcon, color: "#10b981" },
	{ label: "Training", value: 74, icon: Gauge, color: "#f59e42" },
	{ label: "Succession", value: 59, icon: ChartSpline, color: "#f43f5e" },
];

const pieData = [
	{ name: "Completed", value: 320 },
	{ name: "In Progress", value: 120 },
	{ name: "Pending", value: 60 },
];
const COLORS = ["#10b981", "#6366f1", "#f59e42"];

export default function HR2Dashboard() {
	return (
		<div className="p-6 space-y-6">
			<h1 className="text-3xl font-bold text-gray-800 mb-4">HR2 Dashboard</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{summaryData.map((item) => (
					<Card key={item.label} className="shadow-sm">
						<CardHeader className="flex flex-row items-center gap-3 pb-2">
							<item.icon className="size-6" style={{ color: item.color }} />
							<CardTitle className="text-lg font-semibold text-gray-700">{item.label}</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-gray-900">{item.value}%</div>
							<div className="text-xs text-gray-500 mt-1">Avg. Completion</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
				<Card className="shadow-sm">
					<CardHeader>
						<CardTitle>Learning Progress Overview</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={250}>
							<PieChart>
								<Pie
									data={pieData}
									dataKey="value"
									nameKey="name"
									cx="50%"
									cy="50%"
									outerRadius={80}
									label
								>
									{pieData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
									))}
								</Pie>
								<Tooltip />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card className="shadow-sm">
					<CardHeader>
						<CardTitle>Quick Links</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col gap-3">
							<a href="/hr2/cms" className="text-blue-600 hover:underline">Go to Competency Management</a>
							<a href="/hr2/lms" className="text-blue-600 hover:underline">Go to Learning Management</a>
							<a href="/hr2/tms" className="text-blue-600 hover:underline">Go to Training Management</a>
							<a href="/hr2/sps" className="text-blue-600 hover:underline">Go to Succession Planning</a>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
