import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const meta: Meta<typeof Card> = {
  title: "Shadcn UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: { type: "text" },
      description: "CSS class names",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
        <CardAction>Card Action</CardAction>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Thẻ với Footer</CardTitle>
        <CardDescription>Mô tả thẻ có footer</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Nội dung của thẻ ở đây.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Hủy</Button>
        <Button>Xác nhận</Button>
      </CardFooter>
    </Card>
  ),
};

export const ProductCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>iPhone 15 Pro</CardTitle>
        <CardDescription>Điện thoại thông minh cao cấp</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-2xl font-bold">29.999.000 VNĐ</p>
          <p className="text-sm text-muted-foreground">
            Chip A17 Pro, Camera 48MP, Titanium
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Thêm vào giỏ hàng</Button>
      </CardFooter>
    </Card>
  ),
};

export const ProfileCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            JD
          </div>
          <div>
            <CardTitle>John Doe</CardTitle>
            <CardDescription>Software Developer</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          Passionate about creating amazing user experiences with modern web
          technologies.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          Theo dõi
        </Button>
        <Button size="sm">Nhắn tin</Button>
      </CardFooter>
    </Card>
  ),
};

export const StatsCard: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="M12 2v20m8-8H4" />
        </svg>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">45.231.000 VNĐ</div>
        <p className="text-xs text-muted-foreground">
          +20.1% so với tháng trước
        </p>
      </CardContent>
    </Card>
  ),
};

export const NotificationCard: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle className="flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
          Thông báo mới
        </CardTitle>
        <CardDescription>2 phút trước</CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          Bạn có một tin nhắn mới từ khách hàng. Hãy kiểm tra và phản hồi sớm
          nhất có thể.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm">
          Đánh dấu đã đọc
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const SimpleCard: Story = {
  render: () => (
    <Card className="w-[300px] p-6">
      <p>Thẻ đơn giản chỉ có nội dung, không có header hay footer.</p>
    </Card>
  ),
};

export const LoginCard: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link">Sign Up</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" required />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Login
        </Button>
        <Button variant="outline" className="w-full">
          Login with Google
        </Button>
      </CardFooter>
    </Card>
  ),
};
