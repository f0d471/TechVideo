`timescale 1ns/1ps
// 流水行为：四组输入连着送，每一拍打印有效信号与输出。
// 第 1 组用第 4 集的舍入例，第 2 组用第 3 集的规格化例，第 3、4 组用第 5 集的上溢例与下溢例
// 用法（仓库根目录）：node tools/vt.mjs evidence fp32-pipeline，它把素材仓固定提交的快照目录以 SRC_ANCHORFP 传进来
module tb_pipeline_cases;
    reg clk = 0, rst_n = 0, in_valid = 0;
    reg [31:0] a, b;
    wire [31:0] p;
    wire out_valid;
    integer cyc = 0;
    always #5 clk = ~clk;
    fp32_mul_pipe dut (.clk(clk), .rst_n(rst_n), .a(a), .b(b), .p(p),
                       .in_valid(in_valid), .flush(1'b0), .out_valid(out_valid));
    task step(input [31:0] ta, input [31:0] tb_, input send);
        begin
            @(negedge clk); cyc = cyc + 1;
            a = ta; b = tb_; in_valid = send;
            #1 $display("cyc=%0d in_valid=%b a=%h b=%h | v_s1=%b out_valid=%b p=%h",
                        cyc, in_valid, a, b, dut.v_s1, out_valid, p);
        end
    endtask
    initial begin
        a = 32'h00000000; b = 32'h00000000; in_valid = 1'b0;
        repeat (2) @(negedge clk); rst_n = 1;
        step(32'h3F800001, 32'h3FC00000, 1'b1);
        step(32'h3FC00000, 32'h3FC00000, 1'b1);
        step(32'h7F7FFFFE, 32'h3F800001, 1'b1);
        step(32'h00800000, 32'h3F000000, 1'b1);
        step(32'h00000000, 32'h00000000, 1'b0);
        step(32'h00000000, 32'h00000000, 1'b0);
        step(32'h00000000, 32'h00000000, 1'b0);
        $finish;
    end
endmodule
