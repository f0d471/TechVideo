`timescale 1ns/1ps
module tb_rne_cases;
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
            // stage-2 combinational signals are valid while v_s1 is high
            $display("a=%h b=%h prod_n=%b G=%b S=%b L=%b round_up=%b",
                     ta, tb_, dut.u_s2.prod_n, dut.u_s2.guard_bit, dut.u_s2.sticky_bit,
                     dut.u_s2.mant_lsb, dut.u_s2.round_up);
            @(negedge clk);
            $display("  -> p=%h out_valid=%b", p, out_valid);
        end
    endtask
    initial begin
        repeat (2) @(negedge clk); rst_n = 1;
        run(32'h3F800001, 32'h3FC00000);  // tie, lsb odd
        run(32'h3F800003, 32'h3FC00000);  // tie, lsb even
        run(32'h3F800001, 32'h3F800001);  // guard 0
        run(32'h3F800001, 32'h3FC00001);  // guard 1 sticky 1
        $finish;
    end
endmodule
