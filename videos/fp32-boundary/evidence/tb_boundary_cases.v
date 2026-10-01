`timescale 1ns/1ps
// 三组例子：舍入进位（正常写回）、同一个进位在上溢位置、下溢冲零与标准的非规格数对照
// 用法（仓库根目录）：node tools/vt.mjs evidence fp32-boundary，它把素材仓固定提交的快照目录以 SRC_ANCHORFP 传进来
module tb_boundary_cases;
    reg clk = 0, rst_n = 0, in_valid = 0;
    reg [31:0] a, b;
    wire [31:0] p;
    wire out_valid;
    always #5 clk = ~clk;
    fp32_mul_pipe dut (.clk(clk), .rst_n(rst_n), .a(a), .b(b), .p(p),
                       .in_valid(in_valid), .flush(1'b0), .out_valid(out_valid));
    task run(input [31:0] ta, input [31:0] tb_);
        begin
            @(negedge clk); a = ta; b = tb_; in_valid = 1;
            @(negedge clk); in_valid = 0;
            // stage-2 组合信号在 v_s1 为高期间有效
            $display("a=%h b=%h prod_n=%h", ta, tb_, dut.u_s2.prod_n);
            $display("  G=%b S=%b L=%b round_up=%b",
                     dut.u_s2.guard_bit, dut.u_s2.sticky_bit, dut.u_s2.mant_lsb, dut.u_s2.round_up);
            $display("  mant_rnd=%h mant_ovf=%b exp_n=%0d", dut.u_s2.mant_rnd, dut.u_s2.mant_ovf,
                     dut.u_s2.exp_n_s);
            $display("  exp_final=%0d ftz_out=%b overflow=%b", dut.u_s2.exp_final_s,
                     dut.u_s2.ftz_out, dut.u_s2.overflow);
            @(negedge clk);
            $display("  -> p=%h out_valid=%b", p, out_valid);
        end
    endtask
    initial begin
        repeat (2) @(negedge clk); rst_n = 1;
        // 第 1 组：尾数进位，阶码还有余地，正常写回 2.0
        run(32'h3FFFFFFE, 32'h3F800001);
        // 第 2 组：同样的两个尾数，阶码和已在 254，进位后 255，上溢写成正无穷
        run(32'h7F7FFFFE, 32'h3F800001);
        // 第 3 组：积比最小规格化数还小，FTZ 写成零；标准应写成非规格数
        run(32'h00800000, 32'h3F000000);
        // 对照：2^-127 / 2^-149 = 2^22，标准（逐渐下溢）的非规格数编码
        $display("standard (IEEE, no FTZ): %h", 32'h00400000);
        $finish;
    end
endmodule
