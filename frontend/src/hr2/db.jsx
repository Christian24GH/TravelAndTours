import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Gauge, BookOpenCheckIcon, ChartSpline, PieChartIcon } from "lucide-react";

const summaryData = [
	{ label: "Competency", value: 82, icon: PieChartIcon, color: "#6366f1", link: "/hr2/cms" },
	{ label: "Learning", value: 67, icon: BookOpenCheckIcon, color: "#10b981", link: "/hr2/lms" },
	{ label: "Training", value: 74, icon: Gauge, color: "#f59e42", link: "/hr2/tms" },
	{ label: "Succession", value: 59, icon: ChartSpline, color: "#f43f5e", link: "/hr2/sps" },
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
					<Link to={item.link} key={item.label} className="group">
						<Card className="shadow-sm transition-transform group-hover:scale-105 group-hover:shadow-lg cursor-pointer">
							<CardHeader className="flex flex-row items-center gap-3 pb-2">
								<item.icon className="size-6" style={{ color: item.color }} />
								<CardTitle className="text-lg font-semibold text-gray-700">{item.label}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold text-gray-900">{item.value}%</div>
								<div className="text-xs text-gray-500 mt-1">Avg. Completion</div>
							</CardContent>
						</Card>
					</Link>
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
						<CardTitle>Reserved</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col gap-3">
							<a>111 222 333</a>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
