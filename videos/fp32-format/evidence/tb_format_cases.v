`timescale 1ns/1ps
module tb_format_cases;
    reg clk = 0, rst_n = 0, in_valid = 0;
    reg [31:0] a = 0, b = 0;
    wire [31:0] p;
    wire out_valid;
    integer count = 0;
    always #5 clk = ~clk;
    fp32_mul_pipe dut (.clk(clk), .rst_n(rst_n), .a(a), .b(b), .p(p),
                       .in_valid(in_valid), .flush(1'b0), .out_valid(out_valid));
    task run_case(input [255:0] name, input [31:0] ta, input [31:0] tb_,
                  input [31:0] expected, input [5:0] flags);
        begin
            @(negedge clk); a = ta; b = tb_; in_valid = 1;
            #1;
            $display("case=%0s a=%h b=%h", name, a, b);
            $display(" unpack_a sign=%b exp=%d exp_bits=%b frac=%h frac_bits=%b mant=%h",
                     dut.u_s1.a_sign,dut.u_s1.a_exp,dut.u_s1.a_exp,dut.u_s1.a_frac,dut.u_s1.a_frac,dut.u_s1.a_mant);
            $display(" unpack_b sign=%b exp=%d exp_bits=%b frac=%h frac_bits=%b mant=%h",
                     dut.u_s1.b_sign,dut.u_s1.b_exp,dut.u_s1.b_exp,dut.u_s1.b_frac,dut.u_s1.b_frac,dut.u_s1.b_mant);
            $display(" flags a_nan=%b a_inf=%b a_zero=%b b_nan=%b b_inf=%b b_zero=%b",
                     dut.u_s1.a_is_nan,dut.u_s1.a_is_inf,dut.u_s1.a_is_zero,
                     dut.u_s1.b_is_nan,dut.u_s1.b_is_inf,dut.u_s1.b_is_zero);
            if ({dut.u_s1.a_is_nan,dut.u_s1.a_is_inf,dut.u_s1.a_is_zero,
                 dut.u_s1.b_is_nan,dut.u_s1.b_is_inf,dut.u_s1.b_is_zero} !== flags)
                $fatal(1, "classification mismatch: %0s", name);
            if (ta == 32'h3F800001 && tb_ == 32'h3FC00000) begin
                if ({dut.u_s1.a_sign,dut.u_s1.a_exp,dut.u_s1.a_frac} !== 32'h3F800001 ||
                    dut.u_s1.a_mant !== 24'h800001 || dut.u_s1.b_mant !== 24'hC00000)
                    $fatal(1, "normal unpack mismatch");
            end
            @(negedge clk); in_valid = 0;
            $display(" stage2 special=%b zero=%b nan=%b ftz_out=%b",dut.u_s2.spec_sel_r,
                     dut.u_s2.spec_zero_r,dut.u_s2.spec_nan_r,dut.u_s2.ftz_out);
            @(negedge clk);
            if (out_valid !== 1'b1 || p !== expected)
                $fatal(1,"result mismatch %0s p=%h expected=%h valid=%b",name,p,expected,out_valid);
            $display(" result=%h expected=%h out_valid=%b PASS",p,expected,out_valid);
            count = count + 1;
            @(negedge clk);
            if (out_valid !== 1'b0) $fatal(1,"valid did not clear");
        end
    endtask
    initial begin
        repeat (2) @(negedge clk); rst_n = 1;
        run_case("normal_pair",32'h3F800001,32'h3FC00000,32'h3FC00002,6'b000000);
        run_case("input_sub_a",32'h00000001,32'h3F800000,32'h00000000,6'b001000);
        run_case("input_sub_b",32'h3F800000,32'h00000001,32'h00000000,6'b000001);
        run_case("negative_input_sub",32'h80000001,32'h3F800000,32'h80000000,6'b001000);
        run_case("max_input_sub",32'h007FFFFF,32'h3F800000,32'h00000000,6'b001000);
        run_case("min_normal",32'h00800000,32'h3F800000,32'h00800000,6'b000000);
        run_case("output_sub",32'h00800000,32'h3F000000,32'h00000000,6'b000000);
        run_case("scaled_sub",32'h00400000,32'h7E800000,32'h00000000,6'b001000);
        run_case("positive_zero",32'h00000000,32'h3F800000,32'h00000000,6'b001000);
        run_case("negative_zero",32'h80000000,32'h3F800000,32'h80000000,6'b001000);
        run_case("positive_inf",32'h7F800000,32'h3F800000,32'h7F800000,6'b010000);
        run_case("negative_inf",32'hFF800000,32'h3F800000,32'hFF800000,6'b010000);
        run_case("nan_a",32'h7FC00000,32'h3F800000,32'h7FC00000,6'b100000);
        run_case("nan_b",32'h3F800000,32'h7FC00000,32'h7FC00000,6'b000100);
        run_case("inf_times_zero",32'h7F800000,32'h00000000,32'h7FC00000,6'b010001);
        run_case("inf_times_sub",32'h7F800000,32'h00000001,32'h7FC00000,6'b010001);
        $display("PASS %0d cases; fields, classification, result and valid checked",count);
        $finish;
    end
    initial begin
        #10000; $fatal(1,"timeout");
    end
endmodule
