`timescale 1ns/1ps
module tb_mul_cases;
    reg clk = 0, rst_n = 0, in_valid = 0;
    reg [31:0] a = 0, b = 0;
    wire [31:0] p;
    wire out_valid;
    always #5 clk = ~clk;

    fp32_mul_pipe dut (
        .clk(clk), .rst_n(rst_n), .a(a), .b(b), .p(p),
        .in_valid(in_valid), .flush(1'b0), .out_valid(out_valid)
    );

    task automatic run_normal(
        input [127:0] tag,
        input [31:0] ta, tb,
        input [23:0] expected_a_mant, expected_b_mant,
        input expected_sign,
        input integer expected_exp,
        input [47:0] expected_product,
        input [31:0] expected_p
    );
        begin
            @(negedge clk);
            a = ta; b = tb; in_valid = 1;
            #1;
            if (dut.u_s1.a_mant !== expected_a_mant ||
                dut.u_s1.b_mant !== expected_b_mant)
                $fatal(1, "%0s: 24-bit mantissa mismatch", tag);
            if (dut.u_s1.result_sign !== expected_sign)
                $fatal(1, "%0s: sign mismatch", tag);
            if ($signed(dut.u_s1.exp_sum_s0) != expected_exp)
                $fatal(1, "%0s: candidate exponent mismatch", tag);
            if (dut.u_s1.product_s0 !== expected_product)
                $fatal(1, "%0s: 48-bit product mismatch", tag);
            if (dut.u_s1.spec_sel !== 0)
                $fatal(1, "%0s: ordinary input selected special path", tag);
            $display("%0s a=%08h b=%08h ma=%06h mb=%06h sign=%b exp_sum=%0d product=%012h bits=%048b",
                     tag, ta, tb, dut.u_s1.a_mant, dut.u_s1.b_mant,
                     dut.u_s1.result_sign, $signed(dut.u_s1.exp_sum_s0),
                     dut.u_s1.product_s0, dut.u_s1.product_s0);
            @(negedge clk);
            in_valid = 0;
            if (!dut.u_s1.v_s1 || dut.u_s1.product_r !== expected_product ||
                $signed(dut.u_s1.exp_r) != expected_exp)
                $fatal(1, "%0s: stage-1 register mismatch", tag);
            @(negedge clk);
            if (!out_valid || p !== expected_p)
                $fatal(1, "%0s: final result mismatch, got %08h", tag, p);
            $display("  -> p=%08h out_valid=%b", p, out_valid);
        end
    endtask

    task automatic run_special(
        input [127:0] tag,
        input [31:0] ta, tb,
        input expected_conflict, expected_nan_input
    );
        begin
            @(negedge clk);
            a = ta; b = tb; in_valid = 1;
            #1;
            if (dut.u_s1.inf_zero_conflict !== expected_conflict ||
                dut.u_s1.is_nan !== expected_nan_input ||
                dut.u_s1.is_nan_full !== 1)
                $fatal(1, "%0s: special classification mismatch", tag);
            $display("%0s a=%08h b=%08h nan_input=%b inf_zero_conflict=%b is_nan_full=%b",
                     tag, ta, tb, dut.u_s1.is_nan,
                     dut.u_s1.inf_zero_conflict, dut.u_s1.is_nan_full);
            @(negedge clk);
            in_valid = 0;
            if (!dut.u_s1.v_s1 || !dut.u_s1.spec_nan_r)
                $fatal(1, "%0s: special flag register mismatch", tag);
            @(negedge clk);
            if (!out_valid || p !== 32'h7FC00000)
                $fatal(1, "%0s: expected quiet NaN, got %08h", tag, p);
            $display("  -> p=%08h out_valid=%b", p, out_valid);
        end
    endtask

    initial begin
        repeat (2) @(negedge clk);
        rst_n = 1;
        run_normal("main", 32'h3F800001, 32'h3FC00000,
                   24'h800001, 24'hC00000, 1'b0, 127,
                   48'h600000C00000, 32'h3FC00002);
        run_normal("negative", 32'hBF800000, 32'h3FC00000,
                   24'h800000, 24'hC00000, 1'b1, 127,
                   48'h600000000000, 32'hBFC00000);
        run_normal("high_product", 32'h3FC00000, 32'h3FC00000,
                   24'hC00000, 24'hC00000, 1'b0, 127,
                   48'h900000000000, 32'h40100000);
        run_normal("low_exponent", 32'h00800000, 32'h00800000,
                   24'h800000, 24'h800000, 1'b0, -125,
                   48'h400000000000, 32'h00000000);
        run_normal("high_exponent", 32'h7F7FFFFF, 32'h7F7FFFFF,
                   24'hFFFFFF, 24'hFFFFFF, 1'b0, 381,
                   48'hFFFFFE000001, 32'h7F800000);
        run_special("inf_times_zero", 32'h7F800000, 32'h00000000,
                    1'b1, 1'b0);
        run_special("nan_input", 32'h7FC00000, 32'h3FC00000,
                    1'b0, 1'b1);
        $display("all 7 cases passed");
        $finish;
    end
endmodule
